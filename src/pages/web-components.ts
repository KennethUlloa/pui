import "../components/datatable";
import type { DataTable } from "../components/datatable";
import "../components/pagination";
import type { Pagination } from "../components/pagination";
import "../components/searchbar";
import type { Searchbar } from "../components/searchbar";
import "../components/avatar";
import "@/components/sidebar"

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

async function queryUsers(search: string, page: number, pageSize: number) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users?q=${search}&_page=${page}&_limit=${pageSize}`,
  );
  return {
    users: await response.json(),
    total: Number(response.headers.get("X-Total-Count")),
  }
}

function datatableDemo() {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const datatable = document.querySelector("#datatable") as DataTable<User>;
  const pagination = document.querySelector("#pagination") as Pagination;
  const search = document.querySelector("#search") as HTMLInputElement;
  const selected = new Set();
  const sortModel: Record<string, "asc" | "desc"> = {};

  pagination.pageSizes = [5, 10];
  let page = 1;
  let pageSize = 5;
  let q = "";
  
  pagination.addEventListener("pagechange", (event: Event) => {
    page = (event as CustomEvent<{ page: number }>).detail.page;
    pageSize = (event as CustomEvent<{ pageSize: number }>).detail.pageSize;

    queryUsers(q, page, pageSize).then(({ users, total }) => {
      pagination.totalItems = total;
      datatable.rows = users;
    });
  })

  datatable.rowId = (person: User) => String(person.id);
  datatable.isSelected = (person: User) => selected.has(String(person.id));
  datatable.columns = [
    {
      title: "Name",
      key: "name",
      render: (row) => `<div>${row.name}<br/><span class="chip chip-soft chip-0">@${row.username}</span></div>`,
      sortable: true,
      sortDirection: () => sortModel.name,
    },
    {
      title: "Email",
      key: "email",
      render: (row) =>
        `<a class="" href="mailto:${row.email}">${row.email}</a>`,
    },
    {
      title: "Phone",
      key: "phone",
      render: (row) => row.phone,
    },
    {
        title:"Username",
        key:"username",
        render: (row) => row.username,
    },
    {
        title: "Address",
        key: "address",
        render: (row) => `${row.address.city}, ${row.address.street}`,
    }
  ];

  datatable.rowActions = (row) => [
    {
      label: "Edit",
      class: "text-primary",
      href: "#edit/" + row.id,
    },
    {
      label: "Delete",
      class: "text-error",
      action: (row) => {
        confirm("Are you sure?");
        console.log("delete", row);
      },
    },
  ];

  datatable.addEventListener("row-select", (event: Event) => {
    console.log("row-select", event);
    const detail = (event as CustomEvent<{ row: User; checked: boolean }>)
      .detail;
    const person = detail.row;
    const checked = detail.checked;

    if (checked) {
      selected.add(String(person.id));
    } else {
      selected.delete(String(person.id));
    }
    datatable.requestUpdate();
  });

  datatable.addEventListener("row-select-all", (event: Event) => {
    console.log("row-select-all", event);
    const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
    if (checked) {
      datatable.rows.forEach((row) => {
        selected.add(String(row.id));
      });
    } else {
      selected.clear();
    }
    datatable.requestUpdate();
  });

  datatable.addEventListener("column-sort", (event: Event) => {
    console.log("column-sort", event);
    const detail = (event as CustomEvent<{ key: string }>).detail;
    const key: string = detail.key;
    if (key) {
      if (!sortModel[key]) {
        sortModel[key] = "asc";
      } else if (sortModel[key] === "asc") {
        sortModel[key] = "desc";
      } else {
        delete sortModel[key];
      }
      datatable.requestUpdate();
    }
  });

  search.addEventListener("input", () => {
    const value = search.value.toLowerCase();
    q = value;
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = setTimeout(() => {
      datatable.loading = true;
      page = 1;
      queryUsers(value, page, pageSize)
        .then(({ users, total }) => {
          pagination.totalItems = total;
          pagination.currentPage = page;
          datatable.rows = users;
        })
        .finally(() => {
          datatable.loading = false;
        });
    }, 500);
  });

  queryUsers("", page, pageSize).then(({ users, total }) => {
    pagination.totalItems = total;
    pagination.currentPage = page;
    pagination.pageSize = pageSize;
    datatable.rows = users;
  });
}

interface Todo {
  id: number
  userId: number
  title: string
  completed: boolean
}

function searchbarDemo() {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const searchbar = document.querySelector("#searchbar") as Searchbar<Todo>;
    const selected = document.querySelector("#selected") as HTMLDivElement;
    let page = 1;
    let pageSize = 50;
    let search = "";
    let todos: Todo[] = [];
    let total = 0;

    async function queryTodos(search: string, page: number, pageSize: number) {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos?q=${search}&_page=${page}&_limit=${pageSize}`,
      );
      return {
        todos: await response.json(),
        total: Number(response.headers.get("X-Total-Count")),
      }
    }

    searchbar.addEventListener("search", (e: Event) => {
      search = (e as CustomEvent<string>).detail || "";
      page = 1;

      if (timeout !== undefined) clearTimeout(timeout);
      timeout = setTimeout(() => {
        searchbar.loading = true;
        queryTodos(search, page, pageSize)
          .then(({ todos: todos_, total: total_ }) => {
            todos = todos_;
            total = total_;
            searchbar.hasMore = todos.length < total;
            searchbar.options = todos;
          }).finally(() => {
            searchbar.loading = false;
          });
      }, 500);
    });

    searchbar.addEventListener("show-more", () => {
      searchbar.loading = true;
      page += 1;
      queryTodos(search, page, pageSize)
        .then(({ todos: todos_, total: total_ }) => {
          todos = [...todos, ...todos_];
          total = total_;
          searchbar.hasMore = todos.length < total;
          searchbar.options = todos;
        }).finally(() => {
          searchbar.loading = false;
        });
    })

    searchbar.addEventListener("option-select", (e: Event) => {
      const detail = (e as CustomEvent<{ option: Todo }>).detail;
      console.log("option-select", detail.option);
      selected.innerHTML = searchbar.renderOption(detail.option);
    })

    searchbar.optionId = (todo) => String(todo.id);
    searchbar.renderOption = (todo) => todo.title;

    queryTodos("", page, pageSize)
      .then(({ todos: todos_, total: total_ }) => {
        todos = todos_;
        total = total_;
        searchbar.hasMore = todos.length < total;
        searchbar.options = todos;
      }).finally(() => {
        searchbar.loading = false;
      });
}

datatableDemo();
searchbarDemo();
