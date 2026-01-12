import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
githubProvider.addScope("repo"); // Request repo scope for GitHub

function AuthBox() {
  const canvasRef = useRef(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailPasswordAuth = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/onboarding", { replace: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const userDoc = await getDoc(
              firestoreDoc(db, "users", currentUser.uid)
            );
            if (userDoc.exists() && userDoc.data().onboardingComplete) {
              navigate("/api-manager", { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          } catch (err) {
            console.error("Error reading user doc:", err);
            navigate("/onboarding", { replace: true });
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Check if new user
      if (result?.additionalUserInfo?.isNewUser) {
        navigate("/onboarding", { replace: true });
        return;
      }

      // For existing users, check onboarding status
      try {
        const userDoc = await getDoc(
          firestoreDoc(db, "users", result.user.uid)
        );
        if (userDoc.exists() && userDoc.data().onboardingComplete) {
          navigate("/api-manager", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (err) {
        console.error("Error reading user doc:", err);
        navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        window.location.reload();
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email || err.email;
        const pendingCred = GoogleAuthProvider.credentialFromError(err);

        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (!methods || methods.length === 0) {
            setError(
              "An account exists with this email but we cannot determine the provider. Please try another sign-in method."
            );
            return;
          }

          if (methods.includes("password")) {
            const shouldLink = window.confirm(
              "You have an email/password account. Would you like to sign in with your password and link your Google account?\n\n" +
                "This will let you sign in with either method in the future."
            );
            if (shouldLink) {
              setIsSignUp(false);
              setError(
                "Please sign in with your password below, then try Google sign-in again to link accounts."
              );
            } else {
              setError(
                "Sign-in cancelled. Use password sign-in or try another method."
              );
            }
            return;
          }

          const providerName =
            methods[0] === "github.com" ? "GitHub" : "Google";
          const shouldLink = window.confirm(
            `You already have a ${providerName} account with this email. Would you like to link your accounts?\n\n` +
              "This will let you sign in with either method in the future."
          );

          if (shouldLink) {
            const existingProvider =
              methods[0] === "github.com"
                ? new GithubAuthProvider()
                : new GoogleAuthProvider();

            const linkResult = await signInWithPopup(auth, existingProvider);
            await linkWithCredential(linkResult.user, pendingCred);

            if (linkResult?.additionalUserInfo?.isNewUser) {
              navigate("/onboarding", { replace: true });
              return;
            }

            const userDoc = await getDoc(
              firestoreDoc(db, "users", linkResult.user.uid)
            );
            if (userDoc.exists() && userDoc.data().onboardingComplete) {
              navigate("/api-manager", { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          } else {
            setError(
              "Sign-in cancelled. Please sign in with your existing provider or try another method."
            );
          }
        } catch (innerErr) {
          console.error("Error during account linking:", innerErr);
          setError(
            innerErr.message || "Error linking accounts. Please try again."
          );
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, githubProvider);

      // Extract and store GitHub token
      const credential = GithubAuthProvider.credentialFromResult(result);
      const ghToken = credential?.accessToken || null;
      if (ghToken) {
        localStorage.setItem("gh_token", ghToken);
      }

      // Check if new user
      if (result?.additionalUserInfo?.isNewUser) {
        navigate("/onboarding", { replace: true });
        return;
      }

      // For existing users, check onboarding status
      try {
        const userDoc = await getDoc(
          firestoreDoc(db, "users", result.user.uid)
        );
        if (userDoc.exists() && userDoc.data().onboardingComplete) {
          navigate("/api-manager", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (err) {
        console.error("Error reading user doc:", err);
        navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        window.location.reload();
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email || err.email;
        const pendingCred = GithubAuthProvider.credentialFromError(err);

        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (!methods || methods.length === 0) {
            setError(
              "An account exists with this email but we cannot determine the provider. Please try another sign-in method."
            );
            return;
          }

          if (methods.includes("password")) {
            const shouldLink = window.confirm(
              "You have an email/password account. Would you like to sign in with your password and link your GitHub account?\n\n" +
                "This will let you sign in with either method in the future."
            );
            if (shouldLink) {
              setIsSignUp(false);
              setError(
                "Please sign in with your password below, then try GitHub sign-in again to link accounts."
              );
            } else {
              setError(
                "Sign-in cancelled. Use password sign-in or try another method."
              );
            }
            return;
          }

          const providerName =
            methods[0] === "google.com" ? "Google" : "GitHub";
          const shouldLink = window.confirm(
            `You already have a ${providerName} account with this email. Would you like to link your accounts?\n\n` +
              "This will let you sign in with either method in the future."
          );

          if (shouldLink) {
            const existingProvider =
              methods[0] === "google.com"
                ? new GoogleAuthProvider()
                : new GithubAuthProvider();

            const linkResult = await signInWithPopup(auth, existingProvider);
            await linkWithCredential(linkResult.user, pendingCred);

            // Save GitHub token if available from the pending credential
            const ghToken = pendingCred?.accessToken || null;
            if (ghToken) {
              localStorage.setItem("gh_token", ghToken);
            }

            if (linkResult?.additionalUserInfo?.isNewUser) {
              navigate("/onboarding", { replace: true });
              return;
            }

            const userDoc = await getDoc(
              firestoreDoc(db, "users", linkResult.user.uid)
            );
            if (userDoc.exists() && userDoc.data().onboardingComplete) {
              navigate("/api-manager", { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          } else {
            setError(
              "Sign-in cancelled. Please sign in with your existing provider or try another method."
            );
          }
        } catch (innerErr) {
          console.error("Error during account linking:", innerErr);
          setError(
            innerErr.message || "Error linking accounts. Please try again."
          );
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same
  return (
    <div
      style={{
        height: "72vh",
        width: "400px",
        border: "1px solid black",
        position: "relative",
        background:"coral"
      }}

    >
      <div
        style={{
          borderRight: "1px solid black",
          width: "90%",
          height: "100%",
          background: "white",
          position: "relative",
          zIndex: 1,
          overflowY: "hidden",
        }}
      >
        <h1
          style={{
            margin: "0px 20px",
            padding: "5px 0px",
            borderBottom: "5px solid coral",
            fontSize: "24px",
            display:"inline-block"
          }}
        >
          spolm
        </h1>
        <div style={{display:"flex", alignSelf:"center", flexDirection:"column"}}>
          <h1
            style={{
              margin: 0,
              padding: "20px",
              fontWeight: 400,
              fontSize: "18px",
            }}
          >
            {isSignUp ? "Create an Account" : "Sign In"}
          </h1>
          <div style={{ padding: "0px 20px" }}>
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                border: "1px solid black",
                background: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Poppins",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isSignUp ? "Sign Up" : "Sign In"} With{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                height={20}
                style={{ marginLeft: "10px" }}
              >
                <path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z" />
              </svg>
            </button>
            <button
              onClick={handleGithubAuth}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                border: "1px solid black",
                background: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Poppins",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isSignUp ? "Sign Up" : "Sign In"} With{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                height={22}
                style={{ marginLeft: "10px" }}
              >
                <path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z" />
              </svg>
            </button>
            <p style={{ marginTop: "20px", textAlign: "center" }}> Or </p>
          </div>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "10px",
              }}
            >
              <label style={{ marginBottom: "5px" }}>Email</label>
              <input
                placeholder="sriram@spolm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid black",
                  fontFamily: "Poppins",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
              <label style={{ marginBottom: "5px" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid black",
                  fontFamily: "Poppins",
                }}
              />
            </div>
            {error && (
              <p
                style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}
              >
                {error}
              </p>
            )}
            <button
              onClick={handleEmailPasswordAuth}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid black",
                background: "black",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Poppins",
              }}
            >
              {loading ? "Loading..." : "Continue"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                alignSelf: "end",
                marginTop:"10px"
              }}
            >
              {isSignUp ? "Have an Account? " : "Don't have an Account? "}
              <span
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthBox;
