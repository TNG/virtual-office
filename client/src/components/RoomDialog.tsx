import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { makeStyles } from "@material-ui/styles";
import * as Yup from "yup";

import Dialog from "./Dialog";
import theme from "../theme";
import { TextField, Typography } from "@material-ui/core";

const useStyles = makeStyles<typeof theme>((_) => ({
  form: {
    maxWidth: 420,
  },
  row: {
    marginTop: 12,
  },
}));

interface Values {
  id: string;
  name: string;
  password: string;
}

const validationSchema = Yup.object().shape<Values>({
  id: Yup.string()
    .min(5, "Please select an id between 5 and 20 characters")
    .max(20, "Please select an id between 5 and 20 characters")
    .required("Required"),
  name: Yup.string()
    .min(5, "Please select a name between 5 and 20 characters")
    .max(20, "Please select a name between 5 and 20 characters")
    .required("Required"),
  password: Yup.string(),
});

const RoomDialog = (props: { open: boolean; setOpen: (open: boolean) => void }) => {
  const classes = useStyles();

  const [submitError, setSubmitError] = useState("");
  function handleSubmit(values: Values) {
    setSubmitError("");

    const joinUrl = `https://zoom.us/j/${values.id}${values.password ? `?pwd=${values.password}` : ""}`;
    axios
      .post("/api/rooms", {
        id: values.id,
        name: values.name,
        joinUrl,
        temporary: true,
      })
      .then(() => props.setOpen(false))
      .catch((error) => setSubmitError(`Error during room creation: ${error.message}`));
  }

  const formik = useFormik({
    initialValues: {
      id: "",
      name: "",
      password: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  function renderField(fieldName: keyof Values, fieldLabel: string) {
    return (
      <TextField
        id={`room-${fieldName}`}
        className={classes.row}
        label={fieldLabel}
        fullWidth={true}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        helperText={formik.errors[fieldName]}
        error={!!formik.errors[fieldName]}
        value={formik.values[fieldName]}
        name={fieldName}
      />
    );
  }

  return (
    <Dialog
      open={props.open}
      setOpen={props.setOpen}
      title="Add Room"
      variant="small"
      handleOk={formik.submitForm}
      handleCancel={() => props.setOpen(false)}
    >
      <Typography className={classes.row} variant="body2" color="secondary">
        Please note that this room will be only temporary and it will be deleted once the meeting ends. Of course you
        can also delete it at any time by clicking on the delete button on the room card.
      </Typography>

      <Typography className={classes.row} variant="body2" color="error">
        {submitError}
      </Typography>

      <form className={classes.form} onSubmit={formik.submitForm}>
        {renderField("name", "Room Name")}
        {renderField("id", "Meeting ID")}
        {renderField("password", "Meeting Password")}
      </form>
    </Dialog>
  );
};

export default RoomDialog;
