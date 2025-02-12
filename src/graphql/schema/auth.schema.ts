import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    username: String!
    phone: String!
    businessName: String
    accountType: String!
    isEmailVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type VerifyResponse {
    success: Boolean!
    message: String!
  }
  type RegisterResponse {
    success: Boolean!
    message: String!
    user: User
  }
  type Query {
    me: User
    getUserVerificationStatus(email: String!): VerificationStatus!
  }

  type VerificationStatus {
    isVerified: Boolean!
  }

  input RegisterInput {
    email: String!
    password: String!
    confirmPassword: String!
    firstName: String!
    lastName: String!
    username: String!
    phone: String!
    accountType: String!
    businessName: String
  }

  type Mutation {
    register(input: RegisterInput!): RegisterResponse
    login(email: String!, password: String!): AuthPayload!
    verifyEmail(token: String!): VerifyResponse
    resendVerificationEmail(email: String!): VerifyResponse
    forgotPassword(email: String!): Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
  }
`;
