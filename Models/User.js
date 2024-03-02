const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    role: {
      type: String,
      enum: ["user", "company_admin", "admin"],
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        } else if (value.length < 6) {
          throw new Error("Password must be at least 6 characters");
        } else if (value.includes(" ")) {
          throw new Error("Password cannot contain spaces");
        }
      },
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    // photo: {
    //   type: String,
    // },
    gender: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.tokens;
  delete user.password;
  return user;
};

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, "erhansekreter");
  user.tokens = user.tokens.concat({ token });
  user.role = "user";
  await user.save();
  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  try {
    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }
    return user;
  } catch (e) {
    return "Unable to login!";
  }
};
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
