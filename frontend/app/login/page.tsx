"use client"; // This is a client component

import { useState, useRef } from "react";

export default function Login() {
  // Step 1: State to hold the input's value.
  const [inputTextUserName, setInputTextUserName] = useState("");
  const [inputTextUserPassword, setInputTextUserPassword] = useState("");

  // Ref for the password input to focus it programmatically
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Step 3: This function runs when the form is submitted.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // a. Prevent the default browser behavior of reloading the page.
    event.preventDefault();

    // c. Validate that both fields are filled
    if (!inputTextUserName.trim() || !inputTextUserPassword.trim()) {
      alert("Please fill in both username and password.");
      return;
    }

    // b. Show an alert with the text from our state.
    alert(`You submitted: ${inputTextUserName} ${inputTextUserPassword}`);
  };

  const handleUserNameKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault(); 
      passwordInputRef.current?.focus();
    }
  };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                {/* Step 4: Wrap everything in a <form> and attach the handler */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs mt-8">
                    <input
                        type="text"
                        // The placeholder is visible and disappears on type.
                        placeholder="user name"
                        // The aria-label is for screen readers.
                        aria-label="user name"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={inputTextUserName}
                        onChange={(e) => setInputTextUserName(e.target.value)}
                        onKeyDown={handleUserNameKeyDown}
                    />
                    <input
                        ref={passwordInputRef}
                        type="password"
                        // The placeholder is visible and disappears on type.
                        placeholder="user password"
                        // The aria-label is for screen readers.
                        aria-label="user password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={inputTextUserPassword}
                        onChange={(e) => setInputTextUserPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                        disabled={
                            !inputTextUserName.trim() || !inputTextUserPassword.trim()
                        }
                    >
                        Submit
                    </button>
                </form>
            </main>
        </div>
    )
}