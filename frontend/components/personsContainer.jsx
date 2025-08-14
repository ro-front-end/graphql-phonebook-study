import { useState } from "react";
import FindPerson from "./findPerson";
import PersonsList from "./personsList";
import { gql, useQuery } from "@apollo/client";

const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`;

function PersonsContainer() {
  const [nameToSearch, setNameToSearch] = useState("");
  const [showPerson, setShowPerson] = useState(false); // Nuevo estado

  const result = useQuery(FIND_PERSON, {
    variables: { nameToSearch },
    skip: !nameToSearch.trim(),
  });

  const person = result.data?.findPerson;

  const handleShowFindPerson = () => {
    setShowPerson(true); // Activar mostrar componente
  };

  return (
    <div>
      <input
        className="bg-cyan-100 p-4"
        type="text"
        value={nameToSearch}
        placeholder="Search by name"
        onChange={(e) => {
          setNameToSearch(e.target.value);
          setShowPerson(false); // Reiniciar al escribir algo nuevo
        }}
      />

      {person && (
        <button
          className="bg-cyan-900 text-white px-4 py-2 ml-2"
          type="button"
          onClick={handleShowFindPerson}
        >
          Show address
        </button>
      )}

      {showPerson && person && <FindPerson result={person} />}

      <PersonsList />
    </div>
  );
}

export default PersonsContainer;
