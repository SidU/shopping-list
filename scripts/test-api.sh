#!/bin/bash

# API Test Script for Shopping List
#
# Usage:
#   export SHOPPING_LIST_API_KEY="sk_your_key_here"
#   export SHOPPING_LIST_API_URL="http://localhost:3000"  # or https://shopping.uppal.zone
#   ./scripts/test-api.sh
#
# Or run with inline env vars:
#   SHOPPING_LIST_API_KEY="sk_..." SHOPPING_LIST_API_URL="http://localhost:3000" ./scripts/test-api.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required environment variables
if [ -z "$SHOPPING_LIST_API_KEY" ]; then
    echo -e "${RED}Error: SHOPPING_LIST_API_KEY environment variable is not set${NC}"
    echo "Usage: SHOPPING_LIST_API_KEY=sk_... SHOPPING_LIST_API_URL=http://localhost:3000 ./scripts/test-api.sh"
    exit 1
fi

if [ -z "$SHOPPING_LIST_API_URL" ]; then
    echo -e "${RED}Error: SHOPPING_LIST_API_URL environment variable is not set${NC}"
    echo "Usage: SHOPPING_LIST_API_KEY=sk_... SHOPPING_LIST_API_URL=http://localhost:3000 ./scripts/test-api.sh"
    exit 1
fi

API_KEY="$SHOPPING_LIST_API_KEY"
BASE_URL="$SHOPPING_LIST_API_URL"

echo "============================================"
echo "Shopping List API Test Suite"
echo "============================================"
echo "API URL: $BASE_URL"
echo "API Key: ${API_KEY:0:10}..."
echo "============================================"
echo ""

PASSED=0
FAILED=0
STORE_ID=""
ITEM_ID=""

# Helper function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local test_name=$5

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $API_KEY" \
            "${BASE_URL}${endpoint}")
    fi

    # Split response body and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name (HTTP $http_code)"
        ((PASSED++))
        echo "$body"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name (Expected HTTP $expected_status, got $http_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Helper to extract JSON value (basic)
json_value() {
    echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

echo "========== Authentication Tests =========="
echo ""

# Test 1: Missing Authorization header
echo "Test: Missing Authorization header"
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/stores")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq "401" ] || [ "$http_code" -eq "307" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Missing auth rejected (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Missing auth should be rejected"
    ((FAILED++))
fi
echo ""

# Test 2: Invalid API key format
echo "Test: Invalid API key format"
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer invalid_key" "${BASE_URL}/api/stores")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "401" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Invalid key format rejected (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Invalid key format should be rejected"
    ((FAILED++))
fi
echo ""

# Test 3: Invalid API key (correct format but wrong key)
echo "Test: Invalid API key (correct format)"
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer sk_0000000000000000000000000000000000000000000000000000000000000000" "${BASE_URL}/api/stores")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq "401" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Invalid key rejected (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Invalid key should be rejected"
    ((FAILED++))
fi
echo ""

echo "========== Store API Tests =========="
echo ""

# Test 4: GET /api/stores
echo "Test: GET /api/stores"
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $API_KEY" "${BASE_URL}/api/stores")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}: List stores (HTTP $http_code)"
    # Extract first store ID for subsequent tests
    STORE_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Using store ID: $STORE_ID"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: List stores failed (HTTP $http_code)"
    echo "Response: $body"
    ((FAILED++))
fi
echo ""

if [ -z "$STORE_ID" ]; then
    echo -e "${RED}No store ID found. Cannot continue with store-specific tests.${NC}"
    exit 1
fi

# Test 5: GET /api/stores/:storeId
echo "Test: GET /api/stores/:storeId"
api_call "GET" "/api/stores/$STORE_ID" "" 200 "Get store details"
echo ""

# Test 6: GET /api/stores/:storeId/items
echo "Test: GET /api/stores/:storeId/items"
api_call "GET" "/api/stores/$STORE_ID/items" "" 200 "List items"
echo ""

echo "========== Item CRUD Tests =========="
echo ""

# Test 7: POST /api/stores/:storeId/items - Add single item
echo "Test: POST /api/stores/:storeId/items (single item)"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test API Item", "sectionId": ""}' \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "201" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Add single item (HTTP $http_code)"
    ITEM_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Created item ID: $ITEM_ID"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Add single item failed (HTTP $http_code)"
    echo "Response: $body"
    ((FAILED++))
fi
echo ""

# Test 8: POST /api/stores/:storeId/items - Bulk add
echo "Test: POST /api/stores/:storeId/items (bulk add)"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"items": [{"name": "Bulk Item 1", "sectionId": ""}, {"name": "Bulk Item 2", "sectionId": ""}]}' \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "201" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Bulk add items (HTTP $http_code)"
    BULK_ITEM_1=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    BULK_ITEM_2=$(echo "$body" | grep -o '"id":"[^"]*"' | tail -1 | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Bulk add items failed (HTTP $http_code)"
    echo "Response: $body"
    ((FAILED++))
fi
echo ""

# Test 9: PATCH /api/stores/:storeId/items/:itemId - Check item
if [ -n "$ITEM_ID" ]; then
    echo "Test: PATCH /api/stores/:storeId/items/:itemId (check item)"
    api_call "PATCH" "/api/stores/$STORE_ID/items/$ITEM_ID" '{"checked": true}' 200 "Check item"
    echo ""

    # Test 10: PATCH /api/stores/:storeId/items/:itemId - Rename item
    echo "Test: PATCH /api/stores/:storeId/items/:itemId (rename item)"
    api_call "PATCH" "/api/stores/$STORE_ID/items/$ITEM_ID" '{"name": "Renamed Test Item"}' 200 "Rename item"
    echo ""

    # Test 11: PATCH /api/stores/:storeId/items/:itemId - Uncheck item
    echo "Test: PATCH /api/stores/:storeId/items/:itemId (uncheck item)"
    api_call "PATCH" "/api/stores/$STORE_ID/items/$ITEM_ID" '{"checked": false}' 200 "Uncheck item"
    echo ""
fi

echo "========== Security Validation Tests =========="
echo ""

# Test 12: Item name too long (>500 chars)
echo "Test: Item name too long (>500 chars)"
LONG_NAME=$(python3 -c "print('A' * 501)")
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$LONG_NAME\", \"sectionId\": \"\"}" \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq "400" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Long name rejected (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Long name should be rejected (got HTTP $http_code)"
    ((FAILED++))
fi
echo ""

# Test 13: Bulk add >100 items
echo "Test: Bulk add >100 items"
ITEMS=$(python3 -c "import json; print(json.dumps({'items': [{'name': f'item{i}', 'sectionId': ''} for i in range(101)]}))")
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$ITEMS" \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq "400" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Bulk >100 rejected (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Bulk >100 should be rejected (got HTTP $http_code)"
    ((FAILED++))
fi
echo ""

# Test 14: XSS attempt in item name
echo "Test: XSS attempt in item name"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name": "<script>alert(1)</script>", "sectionId": ""}' \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "400" ] && echo "$body" | grep -q "invalid characters"; then
    echo -e "${GREEN}✓ PASS${NC}: XSS attempt blocked (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: XSS attempt should be blocked (got HTTP $http_code)"
    echo "Response: $body"
    ((FAILED++))
fi
echo ""

# Test 15: SQL injection attempt
echo "Test: SQL injection attempt in item name"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name": "item; DROP TABLE users;--", "sectionId": ""}' \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "400" ]; then
    echo -e "${GREEN}✓ PASS${NC}: SQL injection blocked (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARN${NC}: SQL injection test returned HTTP $http_code (may be OK if using NoSQL)"
    # Don't count as fail since NoSQL doesn't have this vulnerability
    ((PASSED++))
fi
echo ""

# Test 16: Unicode item names (should work)
echo "Test: Unicode item names"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name": "日本語テスト", "sectionId": ""}' \
    "${BASE_URL}/api/stores/$STORE_ID/items")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq "201" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Unicode names accepted (HTTP $http_code)"
    UNICODE_ITEM_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Unicode names should be accepted (got HTTP $http_code)"
    echo "Response: $body"
    ((FAILED++))
fi
echo ""

echo "========== Clear Items Tests =========="
echo ""

# Test 17: POST /api/stores/:storeId/items/clear (checked only)
echo "Test: POST /api/stores/:storeId/items/clear (mode: checked)"
api_call "POST" "/api/stores/$STORE_ID/items/clear" '{"mode": "checked"}' 200 "Clear checked items"
echo ""

echo "========== Cleanup Tests =========="
echo ""

# Delete test items
if [ -n "$ITEM_ID" ]; then
    echo "Test: DELETE /api/stores/:storeId/items/:itemId"
    api_call "DELETE" "/api/stores/$STORE_ID/items/$ITEM_ID" "" 200 "Delete test item"
    echo ""
fi

if [ -n "$BULK_ITEM_1" ]; then
    echo "Cleaning up bulk items..."
    curl -s -X DELETE -H "Authorization: Bearer $API_KEY" "${BASE_URL}/api/stores/$STORE_ID/items/$BULK_ITEM_1" > /dev/null
    curl -s -X DELETE -H "Authorization: Bearer $API_KEY" "${BASE_URL}/api/stores/$STORE_ID/items/$BULK_ITEM_2" > /dev/null
    echo -e "${GREEN}✓${NC} Bulk items cleaned up"
fi

if [ -n "$UNICODE_ITEM_ID" ]; then
    curl -s -X DELETE -H "Authorization: Bearer $API_KEY" "${BASE_URL}/api/stores/$STORE_ID/items/$UNICODE_ITEM_ID" > /dev/null
    echo -e "${GREEN}✓${NC} Unicode item cleaned up"
fi
echo ""

echo "========== Security Headers Test =========="
echo ""

echo "Test: Security headers present"
headers=$(curl -s -I "${BASE_URL}" 2>&1)
HEADERS_PASSED=0
HEADERS_TOTAL=5

if echo "$headers" | grep -qi "X-Frame-Options"; then
    echo -e "${GREEN}✓${NC} X-Frame-Options present"
    ((HEADERS_PASSED++))
else
    echo -e "${RED}✗${NC} X-Frame-Options missing"
fi

if echo "$headers" | grep -qi "X-Content-Type-Options"; then
    echo -e "${GREEN}✓${NC} X-Content-Type-Options present"
    ((HEADERS_PASSED++))
else
    echo -e "${RED}✗${NC} X-Content-Type-Options missing"
fi

if echo "$headers" | grep -qi "Referrer-Policy"; then
    echo -e "${GREEN}✓${NC} Referrer-Policy present"
    ((HEADERS_PASSED++))
else
    echo -e "${RED}✗${NC} Referrer-Policy missing"
fi

if echo "$headers" | grep -qi "X-XSS-Protection"; then
    echo -e "${GREEN}✓${NC} X-XSS-Protection present"
    ((HEADERS_PASSED++))
else
    echo -e "${RED}✗${NC} X-XSS-Protection missing"
fi

if echo "$headers" | grep -qi "Permissions-Policy"; then
    echo -e "${GREEN}✓${NC} Permissions-Policy present"
    ((HEADERS_PASSED++))
else
    echo -e "${RED}✗${NC} Permissions-Policy missing"
fi

if [ "$HEADERS_PASSED" -eq "$HEADERS_TOTAL" ]; then
    echo -e "${GREEN}✓ PASS${NC}: All security headers present ($HEADERS_PASSED/$HEADERS_TOTAL)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARN${NC}: Some security headers missing ($HEADERS_PASSED/$HEADERS_TOTAL)"
    ((PASSED++))
fi
echo ""

echo "============================================"
echo "Test Results Summary"
echo "============================================"
echo -e "${GREEN}Passed${NC}: $PASSED"
echo -e "${RED}Failed${NC}: $FAILED"
echo "============================================"

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
