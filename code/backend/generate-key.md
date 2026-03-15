# 1. Generate Private Key 
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# 2. Generate Public Key from Private Key
openssl rsa -pubout -in private_key.pem -out public_key.pem 