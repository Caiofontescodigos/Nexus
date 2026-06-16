# Configuração DNS

## Domínios

- **Frontend:** `nexus.grupoX.sd.ufersa.dev.br`
- **API:** `api.nexus.grupoX.sd.ufersa.dev.br`

## Registros DNS (Route53)

```text
nexus.grupoX.sd.ufersa.dev.br  CNAME  <amplify-domain>.amplifyapp.com
api.nexus.grupoX.sd.ufersa.dev.br  CNAME  <ec2-public-dns>.compute.amazonaws.com
```

Ou usando A records com Elastic IP:

```text
nexus.grupoX.sd.ufersa.dev.br  A  <amplify-static-ip>
api.nexus.grupoX.sd.ufersa.dev.br  A  <ec2-elastic-ip>
```

## Configuração AWS Route53

```bash
# Criar hosted zone
aws route53 create-hosted-zone \
  --name grupoX.sd.ufersa.dev.br \
  --caller-reference $(date +%s)

# Criar registro para frontend
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "nexus.grupoX.sd.ufersa.dev.br",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "<amplify-domain>.amplifyapp.com"}]
      }
    }]
  }'

# Criar registro para API
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.nexus.grupoX.sd.ufersa.dev.br",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "<ec2-public-dns>.compute.amazonaws.com"}]
      }
    }]
  }'
```

## Verificação

```bash
# Testar frontend
curl https://nexus.grupoX.sd.ufersa.dev.br

# Testar API
curl https://api.nexus.grupoX.sd.ufersa.dev.br/health

# Testar Swagger
curl https://api.nexus.grupoX.sd.ufersa.dev.br/api-docs
```
