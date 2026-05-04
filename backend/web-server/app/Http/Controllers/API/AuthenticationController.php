<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthenticationController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|min:3',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed'
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);
        return response()->json([$user, 201]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $request->session()->regenerate();

        return response()->json([Auth::user()]);
    }

    public function logOut(Request $request)
    {
        // Revoke any personal access tokens (if used) and end the session
        if ($request->user()) {
            if (method_exists($request->user(), 'tokens')) {
                $request->user()->tokens()->delete();
            }
        }

        //Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

        public function getUserData(Request $request)
    {
        return response()->json($request->user());
    }

        public function updateUserData(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|min:3',
            'email' => 'sometimes|required|email|unique:users,email,' . $request->user()->id,
        ]);

        $request->user()->update($request->only(['name', 'email']));

        return response()->json($request->user());
    }

        public function updateUserPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed'
        ]);

        $request->user()->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function deleteUser(Request $request)
    {
        /*$request->validate([
            'password' => 'required|min:8|confirmed'
        ]);*/
        
        $request->user()->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }


}
