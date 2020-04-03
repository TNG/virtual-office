import React, { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/styles";

import Dialog from "./Dialog";
import theme from "../theme";
import { TextField, Typography } from "@material-ui/core";

const useStyles = makeStyles<typeof theme>((_) => ({
  form: {
    maxWidth: 420,
  },
  input: {
    marginTop: 12,
  },
}));

const RoomDialog = (props: { open: boolean; setOpen: (open: boolean) => void }) => {
  const classes = useStyles();

  const [id, setId] = useState("");
  const [idError, setIdError] = useState("");
  function handleIdChange(event: ChangeEvent<HTMLInputElement>) {
    setIdError("");
    setId(event.target.value || "");
  }
  function validateId() {
    const valid = id.length < 5 || id.length > 20;
    setIdError(valid ? "Please select an id between 5 and 20 characters" : "");
  }

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setNameError("");
    setName(event.target.value || "");
  }
  function validateName() {
    const valid = name.length < 5 || name.length > 20;
    setNameError(valid ? "Please select a name between 5 and 20 characters" : "");
  }

  const [submitError, setSubmitError] = useState("");
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    validateId();
    validateName();

    if (idError || nameError) {
      return;
    }

    setSubmitError("");
    axios
      .post("/api/rooms", { id, name, joinUrl: `https://zoom.us/j/${id}`, temporary: true })
      .then(() => {
        props.setOpen(false);
      })
      .catch(() => setSubmitError("Error during room creation"));
  }

  return (
    <Dialog
      open={props.open}
      setOpen={props.setOpen}
      title="Add Room"
      variant="small"
      handleOk={handleSubmit}
      handleCancel={() => props.setOpen(false)}
    >
      {submitError && (
        <Typography variant="body2" color="error">
          {submitError}
        </Typography>
      )}

      <form className={classes.form} onSubmit={handleSubmit}>
        <TextField
          id="room-id"
          className={classes.input}
          label="Zoom Meeting ID"
          fullWidth={true}
          required={true}
          helperText={idError}
          error={!!idError}
          onChange={handleIdChange}
          onBlur={validateId}
        />
        <TextField
          id="room-name"
          className={classes.input}
          label="Room Name"
          fullWidth={true}
          required={true}
          helperText={nameError}
          error={!!nameError}
          onChange={handleNameChange}
          onBlur={validateName}
        />
      </form>
    </Dialog>
  );
};

export default RoomDialog;
