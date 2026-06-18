#!/bin/bash
set -e

LAMBDA_NAME="${1:-NexusApi}"
AWS_REGION="${2:-us-east-1}"

echo "=== Nexus API - Lambda Deploy ==="
echo "Lambda: $LAMBDA_NAME"
echo "Region: $AWS_REGION"
echo ""

# Build TypeScript
echo "[1/5] Building TypeScript..."
npx tsc
echo "  ✓ Build complete"

# Copy package.json into dist (required for Lambda module resolution)
echo "[2/5] Copying package.json..."
cp package.json dist/
echo "  ✓ package.json copied"

# Copy node_modules
echo "[3/5] Copying node_modules..."
cp -r node_modules dist/
echo "  ✓ node_modules copied"

# Package
echo "[4/5] Packaging Lambda..."
cd dist
PACKAGE="../nexus-api-$(date +%Y%m%d-%H%M%S).zip"
zip -r "$PACKAGE" . > /dev/null
cd ..
echo "  ✓ Package created: $PACKAGE"

# Deploy
echo "[5/5] Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --zip-file "fileb://$PACKAGE" \
  --region "$AWS_REGION" \
  --output json | jq -r '.LastUpdateStatus'
echo "  ✓ Deploy complete"

echo ""
echo "=== Done ==="
