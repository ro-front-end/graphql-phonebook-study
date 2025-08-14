function FindPerson({ result }) {
  if (!result) return null;

  return (
    <div>
      <h3>PersonFound:</h3>
      <p>Name: {result.name} </p>
      <p>Phone: {result.phone || "N/A"} </p>
      <p>
        Address: {result.address.street},{result.address.city}
      </p>
    </div>
  );
}

export default FindPerson;
