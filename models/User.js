// // /models/User.js
// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema(
//   {
//     email: { type: String, index: true, sparse: true, unique: true, trim: true, lowercase: true },
//     username: { type: String, required: true, trim: true, minlength: 3, maxlength: 32, unique: true },
//     password: { type: String, default: null },
//     googleId: { type: String, index: true, sparse: true, unique: true, default: null },
//     image: { type: String, default: null },

//     // NOWE – do refresh rotacji:
//     refreshTokenHash: { type: String, default: null },
//     tokenVersion: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.User || mongoose.model('User', UserSchema);
// /models/User.js
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			index: true,
			sparse: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		username: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 32,
			unique: true,
		},
		password: { type: String, default: null },
		googleId: { type: String, index: true, sparse: true, unique: true },
		image: { type: String, default: null },

		// --- Refresh token rotacja
		refreshTokenHash: { type: String, default: null },
		tokenVersion: { type: Number, default: 0 },

		// --- Reset hasła
		resetPasswordTokenHash: { type: String, default: null },
		resetPasswordTokenExp: { type: Date, default: null },
	},
	{ timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
