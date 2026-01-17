import { useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";

const EligibilityCheck = ({ onComplete }) => {
    const [checks, setChecks] = useState({
        age: false,
        weight: false,
        donation: false,
        illness: false,
    });

    const criteria = [
        {
            id: "age",
            text: "I am between 18 and 65 years old.",
        },
        {
            id: "weight",
            text: "I weigh 50 kg or more.",
        },
        {
            id: "donation",
            text: "I have not donated blood in the last 3 months.",
        },
        {
            id: "illness",
            text: "I do not have any serious illnesses currently.",
        },
    ];

    const handleCheck = (id) => {
        setChecks((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const allChecked = Object.values(checks).every(Boolean);

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/30">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-serif text-slate-900 mb-2">Eligibility Check</h1>
                <p className="text-slate-500 text-sm">Please confirm the following to proceed</p>
            </div>

            <div className="space-y-4 mb-8">
                {criteria.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleCheck(item.id)}
                        className={`
              cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center gap-4
              ${checks[item.id]
                                ? "bg-red-50/50 border-red-200 shadow-sm"
                                : "bg-white/50 border-slate-200 hover:border-red-200/50 hover:bg-white/80"
                            }
            `}
                    >
                        <div
                            className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors duration-300 shrink-0
                ${checks[item.id]
                                    ? "bg-red-600 border-red-600"
                                    : "border-slate-300 bg-white"
                                }
              `}
                        >
                            {checks[item.id] && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span
                            className={`text-sm font-medium transition-colors duration-300 ${checks[item.id] ? "text-slate-900" : "text-slate-600"
                                }`}
                        >
                            {item.text}
                        </span>
                    </motion.div>
                ))}
            </div>

            <Button
                onClick={onComplete}
                disabled={!allChecked}
                className={`w-full h-12 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 transform
            ${allChecked
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 hover:scale-[1.02]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
        `}
            >
                Proceed to Registration
            </Button>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-red-600 font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default EligibilityCheck;
