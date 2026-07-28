import mongoose from 'mongoose'

const installmentSchema = new mongoose.Schema({
  installment: Number,
  dueDate: Date,
  amount: Number,
  amountPaid: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  paidDate: Date
}, { _id: true })

const paymentLogSchema = new mongoose.Schema({
  installmentId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  amount: Number,
  proofImage: String, // base64 or an uploaded file URL, depending on your storage choice
  note: String
}, { _id: true })

const agreementSchema = new mongoose.Schema({
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional if borrower hasn't joined yet
  lenderName: String,
  borrowerName: { type: String, required: true },
  principal: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  tenureMonths: { type: Number, required: true },
  repaymentType: { type: String, enum: ['emi', 'lump_sum'], default: 'emi' },
  collateral: String,
  startDate: { type: Date, required: true },
  schedule: [installmentSchema],
  paymentLog: [paymentLogSchema],
  borrowerConfirmed: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Agreement', agreementSchema)
