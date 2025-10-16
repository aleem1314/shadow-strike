import React, { useState } from "react";
import { register } from "../lib/dcaTx";
import { useSnackbar } from "../hooks/useSnackbar";

interface FighterFormData {
    name: string;
}

const RegisterPage: React.FC = () => {

    const { showSnackbar } = useSnackbar();

    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<FighterFormData>({
        name: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log("Registering fighter:", formData);
        try {
            const result = await register(formData.name);
            showSnackbar("Registered successfully", "tx-success", result.hash);
        } catch (err: any) {
            showSnackbar(`failed to register ${err.message || JSON.stringify(err)}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center mt-4">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center">🛡️ Create Your Fighter</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-2 font-semibold">Name</label>
                        <input
                            type="text"
                            name="name"
                            min={1}
                            max={100}
                            placeholder="e.g. Hulk"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold mt-4"
                    >
                        {
                            loading ? "Please wait..." : "Create"
                        }
                    </button>
                </form>

                <p className="text-sm text-gray-400 mt-6 text-center">
                    🔒 Your character’s powers are automatically generated and only you can see them.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
