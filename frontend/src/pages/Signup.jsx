import React, { useState } from "react";
import { Link } from "react-router";
import Button from "../components/Button";
import Input from "../components/Input";
import { supabase } from "../SupabaseClient";
import "./Signup.css";

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

      if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("");
        setSuccessMessage(
          "Account Created. Check your email to confirm your account.",
        );
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };
  return (
    <div className="signup-page">
      {/*Create Email Field */}
      <Input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => {setEmail(e.target.value); setErrorMessage(""); setSuccessMessage("")}}
      />
      {/* Create Password Field */}
      <Input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => {setPassword(e.target.value); setErrorMessage(""); setSuccessMessage("")}}
      />

      {/*Create Submit Button */}
      <Button text="Submit" onClick={handleSubmit} disabled={isLoading} />
      <Button
        text="Sign in with Google"
        onClick={handleGoogleSignIn}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        }
      />
      <div className="signup-error"> {errorMessage && <p>{errorMessage} </p>}</div>
      <div className="signup-success"> {successMessage && <p>{successMessage} </p>}</div>
      <p className="signup-signin-prompt">
        Have an account? <Link to="/login" className="signup-signin-link">Sign in</Link>
      </p>
    </div>
  );
};

export default Signup;
