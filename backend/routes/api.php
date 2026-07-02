
<?php

use App\Http\Controllers\Api\FoodDeliveryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (Request $request) {
    return response()->json(['status' => 'ok']);
});

Route::prefix('v1')->group(function () {
    Route::get('home', [FoodDeliveryController::class, 'home']);
    Route::get('menu', [FoodDeliveryController::class, 'menu']);
    Route::post('checkout', [FoodDeliveryController::class, 'checkout']);
    Route::get('order-tracking/{orderId}', [FoodDeliveryController::class, 'orderTracking']);
    Route::get('dashboard', [FoodDeliveryController::class, 'dashboard']);
});
