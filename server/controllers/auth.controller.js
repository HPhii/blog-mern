import {
  oauthValidation,
  signinValidation,
  signupValidation,
} from "../validation/auth.validation.js";
import {
  comparePassword,
  generateUserName,
  genTokenSetCookie,
  hashPassword,
} from "../utils.js";
import Users from "../Schema/User.js";

const handleValidationError = (error, res, statusCode = 400) => {
  return res.status(statusCode).json({ message: error.details[0].message });
};

const sendErrorResponse = (error, res, statusCode = 500) => {
  console.error(`Error: ${error.message}`);
  return res
    .status(statusCode)
    .json({ message: error.message || "Internal server error" });
};

const extractUserToSend = (user) => ({
  userName: user.personal_info.userName,
  email: user.personal_info.email,
  profile_img: user.personal_info.profile_img,
});

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const { error } = signupValidation.validate({ fullName, email, password });

    if (error) return handleValidationError(error, res);

    const isEmailNotUnique = await Users.exists({
      "personal_info.email": email,
    });
    if (isEmailNotUnique)
      return res.status(400).json({ message: "Email already exists." });

    const [hashedPassword, userName] = await Promise.all([
      hashPassword(password),
      generateUserName(email),
    ]);

    const user = await new Users({
      personal_info: {
        fullName,
        userName,
        email,
        password: hashedPassword,
      },
    }).save();

    genTokenSetCookie(user._id, res);
    res.status(201).json(extractUserToSend(user));
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = signinValidation.validate({ email, password });

    if (error) return handleValidationError(error, res, 403);

    const user = await Users.findOne({ "personal_info.email": email });
    if (!user)
      return res.status(404).json({ message: "Incorrect email address" });

    const isMatch = await comparePassword(
      user.personal_info.password,
      password
    );
    if (!isMatch)
      return res.status(403).json({ message: "Incorrect password" });

    genTokenSetCookie(user._id, res);
    res.status(200).json(extractUserToSend(user));
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

export const signout = (req, res) => {
  try {
    res.clearCookie("blogToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

export const oauth = async (req, res) => {
  try {
    const { fullName, email, profile_img } = req.body;
    const { error } = oauthValidation.validate({
      fullName,
      email,
      profile_img,
    });

    if (error) return handleValidationError(error, res);

    let user = await Users.findOne({ "personal_info.email": email });

    if (!user) {
      const userName = await generateUserName(email);
      user = await new Users({
        personal_info: { fullName, email, profile_img, userName },
        google_auth: true,
      }).save();
    }

    genTokenSetCookie(user._id, res);
    res.status(201).json(extractUserToSend(user));
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
