#!/bin/bash
set -e

LAMBDA_NAME="${1:-NexusApi}"
AWS_REGION="${2:-us-east-1}"

echo "=== Nexus API - Lambda Deploy ==="
echo "Lambda: $LAMBDA_NAME"
echo "Region: $AWS_REGION"
echo ""

# Build TypeScript
echo "[1/4] Building TypeScript..."
npx tsc
echo "  ✓ Build complete"

# Copy node_modules
echo "[2/4] Copying node_modules..."
cp -r node_modules dist/
echo "  ✓ node_modules copied"

# Package
echo "[3/4] Packaging Lambda..."
cd dist
PACKAGE="../nexus-api-$(date +%Y%m%d-%H%M%S).zip"
zip -r "$PACKAGE" . > /dev/null
cd ..
echo "  ✓ Package created: $PACKAGE"

# Deploy
echo "[4/4] Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --zip-file "fileb://$PACKAGE" \
  --region "$AWS_REGION" \
  --output json | jq -r '.LastUpdateStatus'
echo "  ✓ Deploy complete"

echo ""
echo "=== Done ==="
