<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user=User::create([
            'name'=>'admin',
            'email'=>'admin@admin.com',
            'password'=>'admin',
            'num_user'=>'0100000000',
        ]);
        $user->assignRole('Admin');
    }
}
