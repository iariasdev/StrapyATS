# StrapyATS — Architecture Notes

## LangGraph Agent Pipeline

`
[PDF Upload] --> [pdf_parser] --> [embedder] --> [ChromaDB]
                                                    |
                                               [match_scorer]
                                                    |
                                              [ats_auditor]
                                                    |
                                              [cv_rewriter]
                                                    |
                                             [cover_letter]
                                                    |
                                            [interview_gen]
                                                    |
                                          [JSON Response to Next.js]
                                                    |
                                      [PDF rendered in browser by user]
`

## Key Design Decisions

1. **ChromaDB PersistentClient** — Uses disk storage, not in-memory. Keeps RAM under 50MB on GCP Cloud Run.
2. **PDF generated client-side** — FastAPI returns structured JSON only. Next.js renders and exports PDF using the browser's print engine (zero server memory/CPU).
3. **Rate Limiting** — 2 free analyses per IP per day. Users can use BYOK (Bring Your Own Key) for unlimited usage.
4. **GCP Cloud Run** — Serverless, scales to zero, 2M requests/month free. No cold-start issues with min-instances=1.
5. **Langfuse** — Full observability: latency per node, token count, quality scores, hallucination detection.
