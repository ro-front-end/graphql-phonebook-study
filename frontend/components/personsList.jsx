import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_PERSONS } from "../client/queries";
import AddPersonForm from "./addPersonForm";
import { DELETE_PERSON } from "../client/mutations";
import EditNumberForm from "./editNumberForm";
import { useState } from "react";
import LoginForm from "./loginForm";

function PersonsList() {
  const { loading, error, data } = useQuery(GET_ALL_PERSONS, {
    refetchQueries: [{ query: GET_ALL_PERSONS }],
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [deletePerson] = useMutation(DELETE_PERSON, {
    refetchQueries: [{ query: GET_ALL_PERSONS }],
  });

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) return <p>Error: {error.message}</p>;

  const persons = data.allPersons;

  if (!persons) return <p>Error loading persons...</p>;

  const handleDeletePerson = async (id) => {
    try {
      await deletePerson({ variables: { id } });
    } catch (err) {
      console.error("Error deleting person: ", err);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.clear();
  };

  return (
    <section className="flex flex-col gap-8 justify-center items-center min-h-screen mx-auto max-w-4xl">
      <h2 className="text-cyan-950 uppercase font-semibold text-3xl">
        Persons
      </h2>
      {persons.length !== 0 ? (
        <ul className="flex flex-col gap-8 w-full bg-cyan-800 p-9">
          {persons.map((p) => (
            <li className="flex gap-2 text-cyan-50 w-full" key={p.id}>
              <div className="grid grid-cols-7 items-center w-full">
                <p className="text-amber-400 col-span-2">{p.name}:</p>
                <p className="col-span-2">{p.phone}</p>
                <div className="flex gap-2 justify-self-end w-full col-span-3">
                  <span
                    className="text-cyan-100 text-lg cursor-pointer hover:text-cyan-200 transition duration-300 ease-in-out"
                    type="button"
                  >
                    <EditNumberForm person={p} />
                  </span>

                  <button
                    className="text-red-400 text-lg cursor-pointer hover:text-red-500 transition duration-300 ease-in-out"
                    onClick={() => handleDeletePerson(p.id)}
                    type="button"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Not users yet</p>
      )}
      {!token ? (
        <LoginForm onLogin={(newToken) => setToken(newToken)} />
      ) : (
        <AddPersonForm />
      )}
      {token ? (
        <button
          onClick={logout}
          className="bg-orange-700 p-2 rounded-xl hover:bg-orange-800 mt-4"
        >
          Logout
        </button>
      ) : null}
    </section>
  );
}

export default PersonsList;
