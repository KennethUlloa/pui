import users from "./users.json";
import artists from "./artists.json";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: string;
  phone: string;
}

export interface Artist {
  id: number;
  name: string;
  soldRecords: number;
  genres: string;
}

export async function getUsers(
  searchText: string,
  page: number,
  pageSize: number,
) {
  const search = searchText.toLocaleLowerCase();
  const results = (users as User[]).filter(
    (user) =>
      user.name.toLowerCase().includes(search) ||
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.address.toLowerCase().includes(search) ||
      user.phone.toLowerCase().includes(search),
  );

  if (results.length > pageSize) {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, results.length);
    return {
      items: results.slice(start, end),
      total: results.length,
    };
  }

  return {
    items: results,
    total: results.length,
  };
}

export async function getArtists(
  searchText: string,
  page: number,
  pageSize: number,
) {
  const search = searchText.toLocaleLowerCase();
  const results = (artists as Artist[]).filter(
    (user) =>
      user.name.toLowerCase().includes(search) ||
      user.genres.toLowerCase().includes(search)
  );

  if (results.length > pageSize) {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, results.length);
    return {
      items: results.slice(start, end),
      total: results.length,
    };
  }

  return {
    items: results,
    total: results.length,
  };
}
