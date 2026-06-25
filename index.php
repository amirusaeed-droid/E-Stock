<?php session_start(); require 'includes/header.php'; require_login();
$items=$pdo->query('SELECT COUNT(*) c FROM items')->fetch()['c'];
$low=$pdo->query('SELECT COUNT(*) c FROM items WHERE current_stock<=min_stock')->fetch()['c'];
$pending=$pdo->query("SELECT COUNT(*) c FROM stock_requests WHERE status='Pending'")->fetch()['c'];
$value=$pdo->query('SELECT COALESCE(SUM(current_stock*unit_price),0) c FROM items')->fetch()['c'];
$recent=$pdo->query('SELECT i.name,s.qty,s.issue_date,s.department FROM stock_out s JOIN items i ON i.id=s.item_id ORDER BY s.id DESC LIMIT 8')->fetchAll();
?><h1>Dashboard</h1><div class="grid"><div class="card"><h3>Total Items</h3><div class="stat"><?=$items?></div></div><div class="card"><h3>Low Stock</h3><div class="stat"><?=$low?></div></div><div class="card"><h3>Pending Requests</h3><div class="stat"><?=$pending?></div></div><div class="card"><h3>Stock Value</h3><div class="stat">MVR <?=number_format($value,2)?></div></div></div><div class="card"><h3>Recent Stock Out</h3><table><tr><th>Date</th><th>Item</th><th>Qty</th><th>Department</th></tr><?php foreach($recent as $r): ?><tr><td><?=e($r['issue_date'])?></td><td><?=e($r['name'])?></td><td><?=e($r['qty'])?></td><td><?=e($r['department'])?></td></tr><?php endforeach ?></table></div><?php require 'includes/footer.php'; ?>
