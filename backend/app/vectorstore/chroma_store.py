import os
import logging
from typing import List, Dict, Any, Optional
import chromadb  # type: ignore
from chromadb.config import Settings as ChromaSettings  # type: ignore
from app.core.config import settings

logger = logging.getLogger("strapy_ats.chroma_store")


class VectorStoreService:
    def __init__(self, persist_directory: Optional[str] = None):
        self.persist_directory: str = persist_directory or settings.CHROMA_PERSIST_PATH
        os.makedirs(self.persist_directory, exist_ok=True)
        
        try:
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            logger.info(f"ChromaDB initialized with PersistentClient at path: {self.persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB PersistentClient: {e}")
            # Fallback to ephemeral client if disk access fails
            self.client = chromadb.Client()

    def get_or_create_collection(self, collection_name: str = "strapy_ats"):
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def index_cv_chunks(self, session_id: str, cv_text: str, chunk_size: int = 500) -> int:
        """
        Splits CV text into semantic chunks and indexes them into ChromaDB for RAG queries.
        """
        collection = self.get_or_create_collection()
        
        # Clean existing chunks for session
        try:
            collection.delete(where={"session_id": session_id})
        except Exception:
            pass

        paragraphs = [p.strip() for p in cv_text.split("\n\n") if len(p.strip()) > 20]
        if not paragraphs:
            # Fallback line chunking
            paragraphs = [line.strip() for line in cv_text.split("\n") if len(line.strip()) > 15]

        documents = []
        ids = []
        metadatas = []

        for idx, paragraph in enumerate(paragraphs):
            doc_id = f"{session_id}_chunk_{idx}"
            documents.append(paragraph)
            ids.append(doc_id)
            metadatas.append({"session_id": session_id, "chunk_index": idx, "source": "cv"})

        if documents:
            collection.add(
                documents=documents,
                ids=ids,
                metadatas=metadatas
            )
            logger.info(f"Indexed {len(documents)} CV chunks into ChromaDB for session {session_id}")

        return len(documents)

    def query_cv_similarity(self, session_id: str, job_requirement_query: str, top_k: int = 3) -> List[str]:
        """
        Queries ChromaDB vectorstore for the CV chunks most semantically relevant to a specific job requirement.
        """
        collection = self.get_or_create_collection()
        try:
            results = collection.query(
                query_texts=[job_requirement_query],
                n_results=top_k,
                where={"session_id": session_id}
            )
            results_docs = results.get("documents") if isinstance(results, dict) else None
            if results_docs and len(results_docs) > 0:
                return results_docs[0]
            return []
        except Exception as e:
            logger.error(f"Error querying ChromaDB vectorstore: {e}")
            return []

    def check_health(self) -> str:
        try:
            _ = self.client.list_collections()
            return "healthy (PersistentClient)"
        except Exception as e:
            return f"degraded ({str(e)})"


vector_store = VectorStoreService()
