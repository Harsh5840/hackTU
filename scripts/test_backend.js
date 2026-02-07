/**
 * End-to-End Backend Test Script (Using curl via execSync)
 * 
 * Usage: node scripts/test_backend.js
 * 
 * Tests all major backend flows:
 * 1. Authentication (Admin & Dealer Login)
 * 2. Inventory (List Products, Warehouses, Stock Adjustment)
 * 3. Orders (Create Order) - Note: Order service requires OS-specific dependencies
 * 4. Analytics (Demand Forecast, Stock Recommendations)
 */

const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000/api';

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

function curl(method, endpoint, body = null, token = null) {
  let cmd = `curl -sS --ipv4 --max-time 10 -X ${method} "${BASE_URL}${endpoint}" -H "Content-Type: application/json"`;
  if (token) cmd += ` -H "Authorization: Bearer ${token}"`;
  if (body) cmd += ` -d "${JSON.stringify(body).replace(/"/g, '\\"')}"`; // Simple escaping

  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }); // Capture stdout and stderr
    try {
      return { status: 200, data: JSON.parse(output) }; 
    } catch {
      return { status: 200, data: output };
    }
  } catch (e) {
    return { status: 500, data: e.message + (e.stderr ? "\nStderr: " + e.stderr.toString() : "") };
  }
}

function log(step, message, status = 'INFO') {
  const color = status === 'PASS' ? COLORS.green : status === 'FAIL' ? COLORS.red : status === 'WARN' ? COLORS.yellow : COLORS.cyan;
  console.log(`${color}[${step}] ${message}${COLORS.reset}`);
}

function runTests() {
  console.log(`${COLORS.blue}╔════════════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║  🚀 Backend E2E Test Suite - Modern Colours Supply Chain       ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚════════════════════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  let results = {
    total: 0,
    passed: 0,
    failed: 0,
    warning: 0
  };
  
  let adminToken = '';
  let dealerToken = '';
  let productId = '';
  let warehouseId = 'WH-001'; // Known from seed

  // ==================== AUTH FLOWS ====================
  console.log(`${COLORS.yellow}📋 Testing Authentication Flows...${COLORS.reset}\n`);
  
  // 1. Admin Login
  results.total++;
  const loginRes = curl('POST', '/auth/login', {
      email: 'admin@moderncolours.com',
      password: 'admin123'
  });
  
  if (loginRes.data.data && loginRes.data.data.tokens && loginRes.data.data.tokens.accessToken) {
    adminToken = loginRes.data.data.tokens.accessToken;
    log('1. Admin Login', 'SUCCESS', 'PASS');
    results.passed++;
  } else {
    log('1. Admin Login', `FAILED: ${JSON.stringify(loginRes.data)}`, 'FAIL');
    results.failed++;
  }

  // 2. Dealer Login
  results.total++;
  const dealerRes = curl('POST', '/auth/login', {
      email: 'dealer1@example.com',
      password: 'dealer123'
  });
  if (dealerRes.data.data && dealerRes.data.data.tokens && dealerRes.data.data.tokens.accessToken) {
      dealerToken = dealerRes.data.data.tokens.accessToken;
      log('2. Dealer Login', 'SUCCESS', 'PASS');
      results.passed++;
  } else {
      log('2. Dealer Login', `FAILED: ${JSON.stringify(dealerRes.data)}`, 'FAIL');
      results.failed++;
  }

  // ==================== INVENTORY FLOWS ====================
  console.log(`\n${COLORS.yellow}📦 Testing Inventory Flows...${COLORS.reset}\n`);
  
  // 3. Get Products
  results.total++;
  const prodRes = curl('GET', '/inventory/products', null, adminToken);
  
  const products = prodRes.data && prodRes.data.data ? prodRes.data.data : [];
  
  if (Array.isArray(products) && products.length > 0) {
      const p = products.find(x => x.sku === 'INT-EML-100' || x.sku === 'P-100');
      if (p) {
          productId = p.id;
          log('3. Get Product ID', `Found ${p.sku} -> ${productId}`, 'PASS');
          results.passed++;
      } else {
          productId = products[0].id;
          log('3. Get Product ID', `Using fallback: ${productId}`, 'WARN');
          results.warning++;
      }
  } else {
      log('3. Get Product ID', `Failed or empty: ${JSON.stringify(prodRes.data).substring(0, 100)}`, 'FAIL');
      results.failed++;
  }
  
  // 4. Get Warehouse ID
  results.total++;
  const whRes = curl('GET', '/inventory/warehouses', null, adminToken);
  
  const warehouses = whRes.data && whRes.data.data ? whRes.data.data : [];

  if (Array.isArray(warehouses) && warehouses.length > 0) {
      const w = warehouses.find(x => x.code === 'WH-001');
      if (w) {
          warehouseId = w.id;
          log('4. Get Warehouse ID', `Found ${w.code} -> ${warehouseId}`, 'PASS');
          results.passed++;
      } else {
         warehouseId = warehouses[0].id;
         log('4. Get Warehouse ID', `Using fallback: ${warehouseId}`, 'WARN');
         results.warning++;
      }
  } else {
      log('4. Get Warehouse ID', `Failed to list warehouses`, 'FAIL');
      results.failed++;
  }

  // 5. Adjust Stock
  results.total++;
  if (productId && warehouseId) {
      const adjRes = curl('POST', '/inventory/adjust', {
        productId,
        warehouseId,
        quantityChange: 5,
        reason: "Test Stock Adjustment"
      }, adminToken);
      
      if (adjRes.data.success) {
          log('5. Adjust Stock', `Stock adjusted successfully (Quantity: ${adjRes.data.data.quantity})`, 'PASS');
          results.passed++;
      } else {
          log('5. Adjust Stock', `Failed: ${JSON.stringify(adjRes.data)}`, 'FAIL');
          results.failed++;
      }
  }

  // ==================== ORDER FLOWS ====================
  console.log(`\n${COLORS.yellow}🛒 Testing Order Flows...${COLORS.reset}\n`);
  
  // 6. Create Order
  results.total++;
  if (dealerToken && productId) {
      const orderRes = curl('POST', '/orders/create', {
          dealerId: "dealer-123",
          items: [{ 
              productId: productId, 
              quantity: 2,
              unitPrice: 500,
              discountPercentage: 5,
              taxPercentage: 18
          }],
          deliveryAddress: { 
              line1: "123 Main Street", 
              city: "Mumbai", 
              state: "Maharashtra", 
              pincode: "400001" 
          }
      }, dealerToken);
      
      if (orderRes.data && (orderRes.data.success || orderRes.data.data)) {
          log('6. Create Order', 'Order created successfully', 'PASS');
          results.passed++;
      } else {
          log('6. Create Order', `Failed: ${JSON.stringify(orderRes.data).substring(0, 200)}`, 'FAIL');
          results.failed++;
      }
  }

  // ==================== ANALYTICS FLOWS ====================
  console.log(`\n${COLORS.yellow}📊 Testing Analytics Flows...${COLORS.reset}\n`);
  
  // 7. Forecast
  results.total++;
  if (productId) {
      const forecastRes = curl('POST', '/analytics/forecast/demand', {
          productId: productId,
          history: [
              {date: "2024-01-01", quantity: 10},
              {date: "2024-01-02", quantity: 12},
              {date: "2024-01-03", quantity: 15},
              {date: "2024-01-04", quantity: 18},
              {date: "2024-01-05", quantity: 20}
          ]
      }, adminToken);
      
      if (forecastRes.data && forecastRes.data.success) {
          const forecastCount = forecastRes.data.forecast ? forecastRes.data.forecast.length : 0;
          log('7. Demand Forecast', `Generated ${forecastCount} forecast points`, 'PASS');
          results.passed++;
      } else {
          log('7. Demand Forecast', `Failed: ${JSON.stringify(forecastRes.data)}`, 'FAIL');
          results.failed++;
      }
  }

  // 8. Stock Recommendations
  results.total++;
  if (productId && warehouseId) {
      const recRes = curl('POST', '/analytics/recommend/stock', {
          inventory: [
              {productId: productId, warehouseId: warehouseId, currentStock: 15}
          ],
          salesVelocity: [
              {productId: productId, avgDailySales: 5}
          ]
      }, adminToken);
      
      if (recRes.data && recRes.data.success) {
          const recCount = recRes.data.recommendations ? recRes.data.recommendations.length : 0;
          log('8. Stock Recommendations', `Generated ${recCount} recommendations`, 'PASS');
          results.passed++;
      } else {
          log('8. Stock Recommendations', `Failed: ${JSON.stringify(recRes.data)}`, 'FAIL');
          results.failed++;
      }
  }

  // ==================== TEST SUMMARY ====================
  console.log(`\n${COLORS.blue}╔════════════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║                         TEST SUMMARY                            ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚════════════════════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  console.log(`${COLORS.cyan}Total Tests:${COLORS.reset}       ${results.total}`);
  console.log(`${COLORS.green}Passed:${COLORS.reset}           ${results.passed}/${results.total}`);
  console.log(`${COLORS.red}Failed:${COLORS.reset}           ${results.failed}`);
  console.log(`${COLORS.yellow}Warnings:${COLORS.reset}         ${results.warning}\n`);
  
  const passPercentage = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`${COLORS.green}Success Rate: ${passPercentage}%${COLORS.reset}\n`);
  
  if (results.failed === 0) {
    console.log(`${COLORS.green}✅ All E2E Tests Completed Successfully!${COLORS.reset}\n`);
  } else {
    console.log(`${COLORS.yellow}⚠️  Some tests had issues - see details above${COLORS.reset}\n`);
  }
}

runTests();
