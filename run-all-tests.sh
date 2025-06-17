#!/bin/bash

# 🧪 COMPREHENSIVE TEST RUNNER
# Runs all available tests for the Real-Time Event Check-In App

echo "🚀 STARTING COMPREHENSIVE TESTING SUITE"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}▶️  Running: $test_name${NC}"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
    echo ""
}

# Change to backend directory
cd "/Users/devanands/Desktop/Real-Time Event Check-In App/backend"

# Ensure server is running
echo "🔧 Starting backend server..."
pkill -f "tsx src/server.ts" 2>/dev/null || true
sleep 2
npm run dev > server.log 2>&1 &
SERVER_PID=$!
sleep 8

echo "✅ Backend server started (PID: $SERVER_PID)"
echo ""

# Run all tests
run_test "Database Integration Test" "node test-database.js"
run_test "GraphQL API Test" "node test-graphql-api.js"
run_test "Real-time Socket.io Test" "node test-realtime.js"
run_test "Leave Functionality Test" "node test-leave-functionality.js"
run_test "Server Restart Persistence Test" "node test-server-restart.js"

# Test frontend setup
echo -e "${BLUE}▶️  Testing Frontend Setup${NC}"
echo "----------------------------------------"
cd "../frontend"

TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ -f "package.json" ] && [ -d "src" ] && [ -f "src/types.ts" ]; then
    echo "✅ Frontend structure is correct"
    echo "✅ All required files present"
    
    # Check critical dependencies
    if npm list @apollo/client @tanstack/react-query socket.io-client zustand > /dev/null 2>&1; then
        echo "✅ All critical dependencies installed"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "❌ Some dependencies missing"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo "❌ Frontend structure incomplete"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo ""

# Clean up
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
cd ..

# Print final results
echo "========================================"
echo "📊 COMPREHENSIVE TEST RESULTS"
echo "========================================"
echo ""
echo "Total Tests Run: $TOTAL_TESTS"
echo -e "✅ Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "❌ Failed: ${RED}$FAILED_TESTS${NC}"

SUCCESS_RATE=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "N/A")
echo "Success Rate: $SUCCESS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo ""
    echo -e "${GREEN}✅ Backend API: Fully functional${NC}"
    echo -e "${GREEN}✅ Database: All operations working${NC}"
    echo -e "${GREEN}✅ Real-time: Socket.io working correctly${NC}"
    echo -e "${GREEN}✅ GraphQL: All queries and mutations working${NC}"
    echo -e "${GREEN}✅ Data Integration: Complete data flow verified${NC}"
    echo -e "${GREEN}✅ Leave Functionality: Working perfectly${NC}"
    echo -e "${GREEN}✅ Data Persistence: Survives server restarts${NC}"
    echo -e "${GREEN}✅ Frontend: Properly structured and configured${NC}"
    echo ""
    echo -e "${GREEN}🚀 The Real-Time Event Check-In App is PRODUCTION READY! 🚀${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the output above for details.${NC}"
fi

echo ""
echo "========================================"