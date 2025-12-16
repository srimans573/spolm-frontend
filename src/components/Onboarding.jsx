import { useEffect, useRef, useState } from "react";
import CustomSelect from "./ui/CustomSelect";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import {v4 as uuidv4} from "uuid";

function Onboarding({ user, onComplete }) {
  const canvasRef = useRef(null);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [howUse, setHowUse] = useState("");
  const [role, setRole] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const fireColors = [
      { r: 255, g: 140, b: 0 },
      { r: 255, g: 165, b: 0 },
      { r: 255, g: 69, b: 0 },
      { r: 255, g: 200, b: 100 },
      { r: 200, g: 50, b: 0 },
      { r: 255, g: 180, b: 50 },
    ];

    const numBlobs = 20;

    for (let i = 0; i < numBlobs; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 80 + Math.random() * 120;

      const color = fireColors[Math.floor(Math.random() * fireColors.length)];

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.filter = "blur(40px)";
    ctx.drawImage(canvas, 0, 0);

    const grainImageData = ctx.getImageData(0, 0, width, height);
    const grainData = grainImageData.data;

    for (let i = 0; i < grainData.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      grainData[i] += noise;
      grainData[i + 1] += noise;
      grainData[i + 2] += noise;
    }

    ctx.putImageData(grainImageData, 0, 0);
  }, []);

  const handleOnboardingNext = () => {
    if (onboardingStep === 1) {
      if (!firstName || !lastName) {
        setError("Please enter your first and last name");
        return;
      }
      setError("");
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      if (!organization || !role) {
        setError("Please enter your organization and role");
        return;
      }
      setError("");
      setOnboardingStep(3);
    }
  };

  const handleOnboardingComplete = async () => {
    if (!phoneNumber || !hearAboutUs) {
      setError("Please complete all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orgId = uuidv4();
      const createdAt = new Date().toISOString();
      await setDoc(doc(db, "organizations", orgId),{
          orgId:orgId,
          organizationName: organization,
          createdAt: createdAt,
          owner: user.uid,
          users: arrayUnion(user.uid)
      })
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        organization: organization,
        orgId: orgId,
        phoneNumber: phoneNumber,
        hearAboutUs: hearAboutUs,
        role: role,
        onboardingComplete: true,
        createdAt: createdAt
      });
      onComplete();
      navigate("/settings");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (onboardingStep === 1) {
      return (
        <>
          <h1
            style={{
              margin: 0,
              padding: "20px",
              fontWeight: 400,
              fontSize: "24px",
            }}
          >
            Welcome! Tell us about yourself
          </h1>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
              <label style={{ marginBottom: "5px" }}>First Name</label>
              <input
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
              <label style={{ marginBottom: "5px" }}>Last Name</label>
              <input
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid black",
                  fontFamily: "Poppins",
                }}
              />
               <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
                marginTop:"20px"
              }}
            >
              <label style={{ marginBottom: "5px" }}>Phone Number</label>
              <input
                placeholder="5558889999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid black",
                  fontFamily: "Poppins",
                }}
              />
            </div>
            </div>
            {error && (
              <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleOnboardingNext}
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
              Continue
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", marginTop: "10px" }}>
              Step 1 of 3
            </p>
          </div>
        </>
      );
    } else if (onboardingStep === 2) {
      return (
        <>
          <h1
            style={{
              margin: 0,
              padding: "20px",
              fontWeight: 400,
              fontSize: "24px",
            }}
          >
            Create Your Organization
          </h1>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
              <label style={{ marginBottom: "5px" }}>Organization Name</label>
              <input
                placeholder="Personal"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
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
              <label style={{ marginBottom: "5px" }}>Role</label>
              <CustomSelect
                options={[
                  { value: '', label: 'Select your role' },
                  { value: 'Developer', label: 'Software Engineer' },
                  { value: 'Designer', label: 'AI/ML Engineer' },
                  { value: 'Product Manager', label: 'Product Manager' },
                  { value: 'Student Intern', label: 'Student Intern' },
                  { value: 'Hobbyist', label: 'Hobbyist' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            {error && (
              <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleOnboardingNext}
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
              Continue
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", marginTop: "10px" }}>
              Step 2 of 3
            </p>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h1
            style={{
              margin: 0,
              padding: "20px",
              fontWeight: 400,
              fontSize: "24px",
            }}
          >
            Almost done!
          </h1>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
              <label style={{ marginBottom: "5px" }}>How did you hear about Spolm?</label>
              <CustomSelect
                options={[
                  { value: '', label: 'Select an option' },
                  { value: 'Search Engine', label: 'Search Engine' },
                  { value: 'Social Media', label: 'Social Media' },
                  { value: 'Friend/Colleague', label: 'Friend/Colleague' },
                  { value: 'Advertisement', label: 'Advertisement' },
                  { value: 'Blog/Article', label: 'Blog/Article' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={hearAboutUs}
                onChange={(e) => setHearAboutUs(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
              <label style={{ marginBottom: "5px" }}>How will you primarily use Spolm?</label>
              <CustomSelect
                options={[
                  { value: '', label: 'Improve prompt engineering' },
                  { value: 'Improve agent response times', label: 'Improve agent response times' },
                  { value: 'Improve agent success rates', label: 'Improve agent success rates' },
                  { value: 'Optimize code structure', label: 'Optimize code structure' },
                  { value: 'Simulate user interactions', label: 'Simulate user interactions' },
                  { value: 'Track user-agent interactions', label: 'Track user-agent interactions' },
                  { value: 'Write documentation for agent', label: 'Write documentation for agent' },
                  { value: 'Multiple of the above', label: 'Multiple of the above' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={howUse}
                onChange={(e) => setHowUse(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            {error && (
              <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleOnboardingComplete}
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
              {loading ? "Saving..." : "Complete"}
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", marginTop: "10px" }}>
              Step 3 of 3
            </p>
          </div>
        </>
      );
    }
  };

  return (
    <div
      style={{
        height: "80vh",
        width: "400px",
        border: "1px solid black",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={800}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      <div
        style={{
          borderRight: "1px solid black",
          width: "90%",
          height: "100%",
          background: "white",
          position: "relative",
          zIndex: 1,
          overflowY: "auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            padding: "10px 20px",
            borderBottom: "1px solid black",
            borderRight: "1px solid black",
            display: "inline-block",
            fontWeight: 400,
            fontFamily:"Libre Baskerville"
          }}
        >
          Spolm
        </h1>
        {renderContent()}
      </div>
    </div>
  );
}

export default Onboarding;