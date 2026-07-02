
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FoodDeliveryController extends Controller
{
    public function home(): JsonResponse
    {
        return response()->json([
            'hero' => [
                'title' => 'Fresh flavors delivered fast',
                'subtitle' => 'Explore local favorites, new menus, and curated promotions',
                'cta' => 'Browse the menu',
                'banner' => 'free-delivery-hero.jpg',
            ],
            'promotions' => [
                ['title' => 'Lunch kickoff', 'description' => 'Save 20% on orders over $25', 'valid_until' => now()->addDays(3)->toDateString()],
                ['title' => 'Midnight cravings', 'description' => 'Free dessert on late-night orders', 'valid_until' => now()->addDays(7)->toDateString()],
            ],
            'featured_restaurants' => $this->sampleRestaurants(),
            'metrics' => [
                ['label' => 'Orders delivered', 'value' => '35K+'],
                ['label' => 'Partner restaurants', 'value' => '420+'],
                ['label' => 'Cities served', 'value' => '18'],
            ],
        ]);
    }

    public function menu(): JsonResponse
    {
        $dishes = $this->sampleMenu();

        return response()->json([
            'categories' => ['Chef specials', 'Fresh bowls', 'Appetizers', 'Desserts'],
            'dishes' => $dishes,
            'updates' => 'New menu just dropped — 5 chef specials added',
        ]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|string',
            'cart.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'delivery_address' => 'required|string',
        ]);

        $menu = collect($this->sampleMenu())->keyBy('id');
        $items = [];
        $subtotal = 0;

        foreach ($validated['cart'] as $item) {
            $menuEntry = $menu->get($item['id']);
            if (!$menuEntry) {
                continue;
            }

            $lineTotal = $menuEntry['price'] * $item['quantity'];
            $items[] = [
                'name' => $menuEntry['name'],
                'quantity' => $item['quantity'],
                'price' => $menuEntry['price'],
                'line_total' => round($lineTotal, 2),
            ];
            $subtotal += $lineTotal;
        }

        $deliveryFee = 4.99;
        $tax = max(0, round($subtotal * 0.075, 2));
        $total = round($subtotal + $deliveryFee + $tax, 2);

        $payment = $this->simulatePayment($validated['payment_method'], $total);

        $order = [
            'order_id' => Str::upper(Str::random(8)),
            'customer' => $validated['customer_name'],
            'delivery_address' => $validated['delivery_address'],
            'items' => $items,
            'summary' => [
                'subtotal' => round($subtotal, 2),
                'delivery_fee' => $deliveryFee,
                'tax' => $tax,
                'total' => $total,
            ],
            'payment' => $payment,
            'estimated_delivery' => now()->addMinutes(35)->format('h:i A'),
        ];

        return response()->json([
            'status' => 'confirmed',
            'message' => 'Order placed successfully',
            'order' => $order,
        ]);
    }

    public function orderTracking(string $orderId): JsonResponse
    {
        $phases = [
            'Order received',
            'Kitchen preparing',
            'Out for delivery',
            'Delivered',
        ];

        $progress = rand(0, 3);

        return response()->json([
            'order_id' => strtoupper($orderId),
            'current_phase' => $phases[$progress],
            'timeline' => array_map(fn($phase, $index) => [
                'stage' => $phase,
                'completed' => $index <= $progress,
            ], $phases, array_keys($phases)),
            'eta_minutes' => 40 - ($progress * 10),
            'last_updated' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $role = $request->query('role', 'customer');

        $payload = match (strtolower($role)) {
            'restaurant' => [
                'title' => 'Restaurant control room',
                'orders_today' => 78,
                'accepted_rate' => '99%',
                'live_orders' => [
                    ['id' => 'T123', 'status' => 'Out for delivery', 'customer' => 'Rebecca'],
                    ['id' => 'T124', 'status' => 'Preparing', 'customer' => 'Marcus'],
                ],
            ],
            'admin' => [
                'title' => 'Operations dashboard',
                'total_orders' => 4200,
                'average_delivery_time' => '32 min',
                'active_restaurants' => 315,
                'issues' => ['One restaurant awaiting verification', 'System load at 68%'],
            ],
            default => [
                'title' => 'Customer dashboard',
                'loyalty_status' => 'Gold',
                'saved_cards' => ['Visa •••• 1234', 'Mastercard •••• 3312'],
                'recent_orders' => [
                    ['id' => 'ORD-879', 'restaurant' => 'Seaside Grill', 'status' => 'Delivered', 'total' => 34.45],
                    ['id' => 'ORD-858', 'restaurant' => 'Falafel Works', 'status' => 'Out for delivery', 'total' => 18.05],
                ],
            ],
        };

        return response()->json($payload);
    }

    protected function sampleMenu(): array
    {
        return [
            ['id' => 'm1', 'name' => 'Truffle mushroom pizza', 'description' => 'Boursin, truffle oil, and wild mushrooms', 'price' => 18.5, 'category' => 'Chef specials', 'image' => 'truffle-pizza.jpg'],
            ['id' => 'm2', 'name' => 'Seared tuna bowl', 'description' => 'Sushi-grade tuna, avocado, sesame rice', 'price' => 15.0, 'category' => 'Fresh bowls', 'image' => 'tuna-bowl.jpg'],
            ['id' => 'm3', 'name' => 'Smoked brisket slider', 'description' => 'House BBQ, pickled onions', 'price' => 12.0, 'category' => 'Appetizers', 'image' => 'brisket-slider.jpg'],
            ['id' => 'm4', 'name' => 'Chili chocolate lava cake', 'description' => 'Dark chocolate, chili, pistachio crumble', 'price' => 8.5, 'category' => 'Desserts', 'image' => 'lava-cake.jpg'],
        ];
    }

    protected function sampleRestaurants(): array
    {
        return [
            ['name' => 'Harbor Kitchen', 'cuisine' => 'Seafood', 'eta' => '28-35 min', 'rating' => 4.9],
            ['name' => 'Sunset Deli', 'cuisine' => 'Mediterranean', 'eta' => '22-30 min', 'rating' => 4.7],
            ['name' => 'Northside Smoke', 'cuisine' => 'BBQ', 'eta' => '26-32 min', 'rating' => 4.8],
        ];
    }

    protected function simulatePayment(string $method, float $amount): array
    {
        return [
            'method' => $method,
            'status' => 'approved',
            'transaction_id' => Str::upper(Str::random(12)),
            'processed_at' => now()->toIso8601String(),
            'amount_charged' => round($amount, 2),
        ];
    }
}
