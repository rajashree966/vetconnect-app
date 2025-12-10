import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const requirements = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p: string) => /\d/.test(p) },
  { label: "Contains special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { strength, passedCount } = useMemo(() => {
    const passed = requirements.filter((req) => req.test(password));
    const count = passed.length;
    let level: "weak" | "fair" | "good" | "strong" = "weak";
    
    if (count >= 5) level = "strong";
    else if (count >= 4) level = "good";
    else if (count >= 3) level = "fair";
    
    return { strength: level, passedCount: count };
  }, [password]);

  const strengthColors = {
    weak: "bg-destructive",
    fair: "bg-orange-500",
    good: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthLabels = {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= passedCount - 1 ? strengthColors[strength] : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className={`text-xs font-medium ${
          strength === "weak" ? "text-destructive" :
          strength === "fair" ? "text-orange-500" :
          strength === "good" ? "text-yellow-600" :
          "text-green-600"
        }`}>
          Password strength: {strengthLabels[strength]}
        </p>
      </div>
      
      <ul className="space-y-1.5">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <li key={index} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={passed ? "text-green-600" : "text-muted-foreground"}>
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
