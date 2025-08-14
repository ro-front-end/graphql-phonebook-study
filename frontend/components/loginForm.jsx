import { useMutation } from "@apollo/client";
import { useState } from "react";
import { LOGIN_USER } from "../client/mutations";
import { useForm } from "react-hook-form";
import client from "../client/apolloClient";

const inputStyle =
  "p-4 bg-cyan-100 outline-cyan-400 border-2 border-cyan-400 focus:rounded-full rounded-xl";

function LoginForm({ onLogin }) {
  const [showForm, setShowForm] = useState(false);
  const [login, { loading, error, data }] = useMutation(LOGIN_USER);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  if (loading) return <p>Loading...</p>;

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const onSubmit = async (formData) => {
    const result = await login({ variables: formData });
    const token = result.data.login.value;
    localStorage.setItem("token", token);
    onLogin(token);
    reset();
    setShowForm(false);
    client.resetStore();
  };
  return (
    <>
      {showForm ? (
        <form
          className="flex flex-col justify-center items-center bg-cyan-900 p-8 gap-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="py-4 uppercase text-cyan-50 text-xl font-semibold">
            Add a New Person!
          </h3>

          <div className=" flex gap-4 items-center justify-center">
            <input
              className={`${inputStyle}`}
              {...register("username", { required: true })}
              placeholder="User name"
            />
            {errors.username && <p>User name is required.</p>}

            <input
              className={`${inputStyle}`}
              {...register("password", { required: true })}
              placeholder="Password"
              type="password"
            />
            {errors.password && <p>Password is required.</p>}
          </div>

          <div className="flex gap-4 w-full">
            <button
              className="bg-cyan-400 p-4 rounded-xl hover:bg-cyan-500 cursor-pointer transition duration-300 ease-in-out font-semibold w-[50%] "
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}{" "}
            </button>

            <button
              className="bg-slate-400 p-4 rounded-xl hover:bg-slate-500 cursor-pointer transition duration-300 ease-in-out font-semibold w-[50%]"
              type="button"
              onClick={handleCloseForm}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          {error && <p>Error:{error.message}</p>}
        </form>
      ) : (
        <button
          onClick={handleShowForm}
          className="bg-cyan-400 p-4 rounded-xl hover:bg-cyan-500 cursor-pointer transition duration-300 ease-in-out font-semibold my-4"
          type="button"
          disabled={loading}
        >
          Login
        </button>
      )}
    </>
  );
}

export default LoginForm;
