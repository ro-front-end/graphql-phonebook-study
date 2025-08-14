import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { EDIT_NUMBER } from "../client/mutations";
import { useForm } from "react-hook-form";
import { GET_ALL_PERSONS } from "../client/queries";

const inputStyle =
  "text-cyan-950 p-4 bg-cyan-100 outline-cyan-400 border-2 border-cyan-400 focus:rounded-full rounded-xl";

function EditNumberForm({ person }) {
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: person.name,
      phone: person.phone,
    },
  });

  const [changeNumber, { loading, error, data }] = useMutation(EDIT_NUMBER, {
    refetchQueries: [{ query: GET_ALL_PERSONS }],
  });

  useEffect(() => {
    reset({
      name: person.name,
      phone: person.phone || "",
    });
  }, [person, reset]);

  const handleEditNumberSubmit = async (formData) => {
    try {
      await changeNumber({ variables: formData });

      reset();
      setShowForm(false);
    } catch (err) {
      console.error("Error editing phone:", err);
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <>
      {showForm ? (
        <form
          className="flex flex-col bg-cyan-900 p-8 gap-8"
          onSubmit={handleSubmit(handleEditNumberSubmit)}
        >
          <h3 className="py-4 uppercase text-cyan-50 text-xl font-semibold">
            Edit Number!
          </h3>

          <div className=" flex gap-4 items-center justify-center">
            <input
              className={`${inputStyle}`}
              {...register("name", { required: true })}
              placeholder="Name"
            />
            {errors.name && <p>Name is required.</p>}
          </div>

          <input
            className={`${inputStyle}`}
            {...register("phone", { required: true })}
            placeholder="Phone"
          />
          {errors.phone && <p>Phone is required.</p>}

          <div className=" flex gap-4 items-center justify-between w-full ">
            <button
              className="bg-cyan-400 p-4 rounded-xl hover:bg-cyan-500 cursor-pointer transition duration-300 ease-in-out font-semibold w-[50%] "
              type="submit"
              disabled={loading}
            >
              {loading ? "Editing..." : "Edit phone"}{" "}
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
          {data && <p>Created: {data.editNumber.name}</p>}
        </form>
      ) : (
        <button
          onClick={handleShowForm}
          className="bg-cyan-400 p-2 rounded-xl hover:bg-cyan-500 cursor-pointer transition duration-300 ease-in-out font-semibold my-4"
          type="button"
          disabled={loading}
        >
          Edit number
        </button>
      )}
    </>
  );
}

export default EditNumberForm;
