"use client"; // This is a client component

import { useState, useRef, FormEvent} from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);

    const passwordInputRef = useRef<HTMLInputElement>(null);
    const passwordConfirmInputRef = useRef<HTMLInputElement>(null);



    const handleLogin = async () => {
        // ... (rest of the function is unchanged)
        try {
            await pb.collection('users').authWithPassword(email, password);
            setError(null);
            alert("Login successful!");
        } catch (err: unknown) {
            setError(
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message?: unknown }).message)
                    : "Failed to log in."
            );
        }
    };

    const handleSignUp = async () => {
        // ... (rest of the function is unchanged)
        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }
        try {
            await pb.collection('users').create({
                email,
                password,
                passwordConfirm,
            });
            setError(null);
            await handleLogin();
            alert("Sign up successful and logged in!");
        } catch (err : unknown) {
            setError(typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message?: unknown }).message)
                    : "Failed to sign up.");
        }
    };
    
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (isSignUp) {
            handleSignUp();
        } else {
            handleLogin();
        }
    };
    
    // ... (KeyDown handlers are unchanged)
    const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            passwordInputRef.current?.focus();
        }
    };

    const handlePasswordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (isSignUp && event.key === "Enter") {
            event.preventDefault();
            passwordConfirmInputRef.current?.focus();
        }
    };
    
    const isButtonDisabled = !email.trim() || !password.trim() || (isSignUp && !passwordConfirm.trim());

    // This JSX will now only render on the client, preventing the mismatch
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                <h1 className="text-3xl font-bold">{isSignUp ? "Create an Account" : "Log In"}</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs mt-4">
                    {/* The rest of your form JSX remains exactly the same */}
                    <input
                        type="email"
                        placeholder="email"
                        aria-label="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                        required
                    />
                    <input
                        ref={passwordInputRef}
                        type="password"
                        placeholder="password"
                        aria-label="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handlePasswordKeyDown}
                        required
                    />
                    {isSignUp && (
                        <input
                            ref={passwordConfirmInputRef}
                            type="password"
                            placeholder="confirm password"
                            aria-label="confirm password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                        disabled={isButtonDisabled}
                    >
                        {isSignUp ? "Sign Up" : "Login"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p>
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-blue-500 hover:underline focus:outline-none"
                        >
                            {isSignUp ? "Log In" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
}