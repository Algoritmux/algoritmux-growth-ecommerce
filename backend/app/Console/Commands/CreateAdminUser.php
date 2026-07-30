<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria com segurança o primeiro administrador do painel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (User::query()->where('is_admin', true)->exists()) {
            $this->components->error('Já existe um administrador. Nenhum usuário foi criado.');

            return self::FAILURE;
        }

        $name = trim((string) $this->ask('Nome do administrador'));
        $email = mb_strtolower(trim((string) $this->ask('E-mail do administrador')));
        $password = (string) $this->secret('Senha');
        $passwordConfirmation = (string) $this->secret('Confirme a senha');

        $validator = Validator::make(
            [
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'password_confirmation' => $passwordConfirmation,
            ],
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'lowercase', 'email:rfc', 'max:254', 'unique:users,email'],
                'password' => [
                    'required',
                    'string',
                    'confirmed',
                    Password::min(12)->mixedCase()->numbers()->symbols(),
                ],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->components->error($message);
            }

            return self::FAILURE;
        }

        $user = new User;
        $user->name = $name;
        $user->email = $email;
        $user->password = Hash::make($password);
        $user->is_admin = true;
        $user->save();

        $this->components->info('Administrador criado com sucesso.');

        return self::SUCCESS;
    }
}
