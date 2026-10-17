import "../components/datatable";
import type { DataTable } from "../components/datatable";
import "../components/pagination";
import type { Pagination } from "../components/pagination";

type Person = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const datatable = document.querySelector("#datatable") as DataTable<Person>;
const pagination = document.querySelector("#pagination") as Pagination;
const search = document.querySelector("#search") as HTMLInputElement;

pagination.pageSizes = [5, 10, 25, 50, 100, 200];

const selected = new Set();

const data = [
    {
        id: 1,
        first_name: "Morgan",
        last_name: "Lee",
        email: "mlee@me.com"
    },
    {
        id: 2,
        first_name: "Sam",
        last_name: "Rivera",
        email: "srivera@me.com"
    },
    {
        id: 3,
        first_name: "Jordan",
        last_name: "Kim",
        email: "jkim@me.com"
    }
];

datatable.rowId = (person: Person) => String(person.id)
datatable.isSelected = (person: Person) => selected.has(String(person.id))
datatable.addEventListener("row-select", (event: CustomEvent) => {
    console.log("row-select", event);
    const detail = event.detail;
    const person = detail.row as Person;
    const checked = detail.checked;

    if (checked) {
        selected.add(String(person.id));
    } else {
        selected.delete(String(person.id));
    }
    datatable.requestUpdate();
})

datatable.addEventListener("row-select-all", (event: CustomEvent) => {
    console.log("row-select-all", event);
    const detail = event.detail;
    const checked = detail.checked;
    if (checked) {
        data.forEach(person => selected.add(String(person.id)));
    } else {
        selected.clear();
    }
    datatable.requestUpdate();
})

datatable.columns = [
    {
        title: "First name",
        key: "first_name",
        render: row => row.first_name
    },
    {
        title: "Last name",
        key: "last_name",
        render: row => row.last_name
    },
    {
        title: "Email",
        key: "email",
        render: row => `<a class="" href="mailto:${row.email}">${row.email}</a>`
    }
];

datatable.rowActions = (row) => [
            {
                label: "Edit",
                class: "text-primary",
                href: "#edit/" + row.id
            },
            {
                label: "Delete",
                class: "text-error",
                action: (row) => {
                    confirm("Are you sure?");
                    console.log("delete", row);
                }
            }
        ]


datatable.rows = data;

search.addEventListener("input", (event) => {
    const value = event.target.value.toLowerCase();
    if (value) {
        datatable.rows = data.filter(person => person.first_name.toLowerCase().includes(value) || person.last_name.toLowerCase().includes(value));
    } else {
        datatable.rows = data;
    }
})