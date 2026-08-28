import React, { useState } from "react";
import { Link } from "react-router";
import Button from "../components/Button";
import Input from "../components/Input";
import { supabase } from "../SupabaseClient";
import "./Signup.css";
import { signInWithProvider } from "../oauth";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      //console.log("the data is", data);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("");
        setSuccessMessage(
          "Account Created. Check your email to confirm your account.",
        );
        console.log(successMessage);
        const result = await upload_default_clothes(data.user.id);
        const { error: usersTableInsertError } = await supabase
          .from("users")
          .update({ email: email })
          .eq("id", data.user.id);
        if (usersTableInsertError) {
          console.log("problem putting email in users table.")
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn =  () => { signInWithProvider("google")};

  const handleAppleSignIn = () => { signInWithProvider("apple")};

  const upload_default_clothes = async (user_id) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/add_default_pieces_on_signup`,
      {
        method: "POST",
        body: JSON.stringify({
          user_id: user_id,
        }),
        headers: { "Content-Type": "application/json" },
      },
    );
    return await response.json();
  };

  return (
    <div className="signup-page">
      <div className="signup-wordmark">ABRIMA</div>
      {/*Create Email Field */}
      <Input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrorMessage("");
          setSuccessMessage("");
        }}
      />
      {/* Create Password Field */}
      <Input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrorMessage("");
          setSuccessMessage("");
        }}
      />

      {/*Create Submit Button */}
      <Button text="Sign Up" onClick={handleSubmit} disabled={isLoading} />
      <Button
        text="Sign up with Google"
        onClick={handleGoogleSignIn}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="18"
            height="18"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
        }
      />
      <Button
        text="Sign up with Apple"
        onClick={handleAppleSignIn}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              fill="currentColor"
              d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.633.95 3.55.95.865 0 2.222-1.01 3.86-1.01.615 0 2.937.06 4.462 2.25-.115.075-2.673 1.61-2.673 4.61 0 3.5 3.02 4.75 3.048 4.75z"
            />
          </svg>
        }
      />
      <div className="signup-error">
        {" "}
        {errorMessage && <p>{errorMessage} </p>}
      </div>
      <div className="signup-success">
        {" "}
        {successMessage && <p>{successMessage} </p>}
      </div>
      <p className="signup-signin-prompt">
        Have an account?{" "}
        <Link to="/login" className="signup-signin-link">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
