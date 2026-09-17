// Demo auth reset — wipes stale users + wallets so fresh demo accounts are
// auto-created on next login (see user-service AuthService.login):
//   admin@shop.com / Admin@123  (ADMIN, U-ADMIN01)
//   user@shop.com  / User@123   (CUSTOMER, U-USER01)
// Run AFTER mongo is up, BEFORE logging in:
//   mongosh --file seed/demo_auth_reset.js
// Then restart user-service (stop-backend.ps1 first — JAR locks on Windows)
// and log in via UI. Wallets are recreated automatically on login.

db = db.getSiblingDB("ecom");

const u = db.users.deleteMany({});
print("Deleted users: " + u.deletedCount);

let w = { deletedCount: 0 };
try {
  w = db.getCollection("reward_wallets").deleteMany({});
} catch (e) {
  print("reward_wallets collection missing — skipping (" + e + ")");
}
print("Deleted reward_wallets: " + w.deletedCount);

try {
  const tx = db.getCollection("reward_transactions").deleteMany({});
  print("Deleted reward_transactions: " + tx.deletedCount);
} catch (e) {
  print("reward_transactions collection missing — skipping");
}

print("Remaining users: " + db.users.countDocuments());
print("Done. Now login to recreate demos:");
print("  Customer: user@shop.com / User@123  -> http://localhost:4200/login");
print("  Admin:    admin@shop.com / Admin@123 -> http://localhost:4200/admin/login");
