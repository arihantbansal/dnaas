# Durable Nonces as a Service

Create nonce accounts that can be used to send transactions without needing to fetch latest blockhash.

1. Connect Wallet
2. Create `x` number of nonce accounts
3. Create a tx locally, and partially sign it and serialize it
4. Paste the serialized tx in our app
5. Click submit tx