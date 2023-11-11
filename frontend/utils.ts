"use client";

export enum UserType {
  Therapist = "therapist",
  Patient = "patient",
}

export function setUser(userType: UserType) {
  localStorage.setItem("user-type", userType);
}
export function getUser() {
  return localStorage.getItem("user-type");
}