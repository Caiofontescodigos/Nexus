# Deploy AWS

## 1. Banco de Dados (RDS PostgreSQL)

```bash
# Criar instância RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier nexus-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username nexus \
  --master-user-password nexus123 \
  --allocated-storage 20 \
  --publicly-accessible

# Obter endpoint
aws rds describe-db-instances --db-instance-identifier nexus-db \
  --query "DBInstances[0].Endpoint.Address"
```

Atualizar `DATABASE_URL` no backend com o endpoint do RDS.

## 2. Backend (EC2 com Docker)

```bash
# Conectar na EC2
ssh -i ~/.ssh/nexus-key.pem ubuntu@<ec2-public-ip>

# Instalar Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Clonar repositório
git clone <repo-url> /home/ubuntu/nexus
cd /home/ubuntu/nexus

# Criar .env.production
cat > .env <<EOF
DATABASE_URL=postgresql://nexus:nexus123@<rds-endpoint>:5432/nexusdb?schema=public
JWT_SECRET=<generate-secure-secret>
PORT=3001
NODE_ENV=production
EOF

# Executar com Docker Compose
docker compose -f docker-compose.prod.yml up -d --build
```

## 3. Frontend (Amplify)

```bash
# Conectar Amplify ao repositório
aws amplify create-app \
  --name nexus-frontend \
  --repository <repo-url> \
  --platform web

# Configurar variáveis de ambiente
aws amplify update-app \
  --app-id <app-id> \
  --environment-variables VITE_API_URL=https://api.nexus.grupoX.sd.ufersa.dev.br

# Fazer deploy
aws amplify start-deployment \
  --app-id <app-id> \
  --branch main
```

## 4. Docker Compose Produção

```yaml
version: "3.8"
services:
  backend:
    build: ./backend-api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3001
      - NODE_ENV=production
    restart: unless-stopped
```

## 5. Health Check

```bash
# Verificar backend
curl https://api.nexus.grupoX.sd.ufersa.dev.br/health

# Resposta esperada:
# {"status":"ok","service":"nexus-api"}
```
