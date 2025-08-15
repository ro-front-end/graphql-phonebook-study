import { useMutation, useSubscription } from "@apollo/client";
import { useForm } from "react-hook-form";
import { CREATE_PERSON } from "../client/mutations";
import { useState } from "react";
import { GET_ALL_PERSONS, PERSON_ADDED } from "../client/queries";

const inputStyle =
  "p-4 bg-cyan-100 outline-cyan-400 border-2 border-cyan-400 focus:rounded-full rounded-xl";

const updateCache = (cache, query, addedPerson) => {
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.name;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allPersons }) => {
    return {
      allPersons: uniqByName(allPersons.concat(addedPerson)),
    };
  });
};

function AddPersonForm() {
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [createPerson, { loading, error, data }] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: GET_ALL_PERSONS }],
  });

  useSubscription(PERSON_ADDED, {
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (!subscriptionData || !subscriptionData.data) return;

      const addedPerson = subscriptionData.data.personAdded;
      if (!addedPerson) return;

      alert(`${addedPerson.name} added`);
      updateCache(client.cache, { query: GET_ALL_PERSONS }, addedPerson);
    },
  });

  const onSubmit = async (formData) => {
    try {
      await createPerson({ variables: formData });
      reset();
      setShowForm(false);
    } catch (err) {
      console.error(err);
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
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="py-4 uppercase text-cyan-50 text-xl font-semibold">
            Add a New Person!
          </h3>

          <div className=" flex gap-4 items-center justify-center">
            <input
              className={`${inputStyle}`}
              {...register("name", { required: true })}
              placeholder="Name"
            />
            {errors.name && <p>Name is required.</p>}

            <input
              className={`${inputStyle}`}
              {...register("city", { required: true })}
              placeholder="City"
            />
            {errors.city && <p>City is required.</p>}
          </div>

          <input
            className={`${inputStyle}`}
            {...register("phone", { required: true })}
            placeholder="Phone"
          />
          {errors.phone && <p>Phone is required.</p>}

          <input
            className={`${inputStyle}`}
            {...register("street", { required: true })}
            placeholder="Street"
          />
          {errors.street && <p>Street is required.</p>}

          <div className=" flex gap-4 items-center justify-between w-full ">
            <button
              className="bg-cyan-400 p-4 rounded-xl hover:bg-cyan-500 cursor-pointer transition duration-300 ease-in-out font-semibold w-[50%] "
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Person"}{" "}
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
          {data && <p>Created: {data.addPerson.name}</p>}
        </form>
      ) : (
        <button
          onClick={handleShowForm}
          className="bg-cyan-400 p-4 rounded-xl hover:bg-cyan-500 cursor-pointer transition duration-300 ease-in-out font-semibold my-4"
          type="button"
          disabled={loading}
        >
          Add Person
        </button>
      )}
    </>
  );
}

export default AddPersonForm;
