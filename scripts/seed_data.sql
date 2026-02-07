-- Auth Service Seed
INSERT INTO "auth"."User" ("id", "email", "password", "role", "isVerified") VALUES
('admin-uuid', 'admin@moderncolours.com', '$2a$10$YourHashedPasswordHere', 'ADMIN', true),
('dealer-1-uuid', 'dealer1@moderncolours.com', '$2a$10$YourHashedPasswordHere', 'DEALER', true);

-- Inventory Service Seed
-- Warehouses
INSERT INTO "inventory"."Warehouse" ("id", "name", "location", "capacity") VALUES
('wh-1', 'Central Warehouse Mumbai', 'Mumbai, MH', 10000),
('wh-2', 'North Regional Hub', 'Delhi, DL', 5000);

-- Products
INSERT INTO "inventory"."Product" ("id", "sku", "name", "category", "price", "reorderLevel") VALUES
('prod-1', 'PNT-EXT-RED', 'Exterior Red Paint 4L', 'Exterior', 1200.00, 50),
('prod-2', 'PNT-INT-WHT', 'Interior White Emulsion 10L', 'Interior', 2500.00, 30),
('prod-3', 'PNT-WD-FIN', 'Wood Finish Gloss 1L', 'Wood', 450.00, 100);

-- Inventory
INSERT INTO "inventory"."Inventory" ("id", "productId", "warehouseId", "quantity", "batchNumber") VALUES
('inv-1', 'prod-1', 'wh-1', 200, 'BATCH-001'),
('inv-2', 'prod-2', 'wh-1', 50, 'BATCH-001'), -- Low stock
('inv-3', 'prod-3', 'wh-2', 500, 'BATCH-002');

-- Dealer Service Seed
INSERT INTO "dealers"."Dealer" ("id", "userId", "dealerCode", "businessName", "email", "phone", "gstNumber", "panNumber", "verificationStatus", "accountStatus", "city", "state", "pincode", "firstName", "lastName", "designation", "addressLine1", "bankAccountName", "bankAccountNumber", "bankIfscCode", "bankName", "bankBranchName", "businessType") VALUES
('dlr-1', 'dealer-1-uuid', 'DLR-2024-001', 'Rainbow Paints Store', 'dealer1@moderncolours.com', '9876543210', '27ABCDE1234F1Z5', 'ABCDE1234F', 'APPROVED', 'ACTIVE', 'Mumbai', 'Maharashtra', '400001', 'Rahul', 'Sharma', 'Owner', 'Shop 12, MG Road', 'Rainbow Paints', '1234567890', 'SBIN0001234', 'SBI', 'Mumbai Main', 'PROPRIETORSHIP');

-- Order Service Seed
INSERT INTO "orders"."Order" ("id", "orderNumber", "dealerId", "status", "totalAmount", "createdAt") VALUES
('ord-1', 'ORD-1001', 'dlr-1', 'DELIVERED', 50000.00, NOW() - INTERVAL '5 days'),
('ord-2', 'ORD-1002', 'dlr-1', 'PROCESSING', 12000.00, NOW() - INTERVAL '1 day');
