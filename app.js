const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const port = 3000;
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

app.use(express.static("./public"));

const viewspath = path.join(__dirname, "./views/pages");
app.set("views", viewspath);
app.set("view engine", "ejs");

const dataPath = path.join(".", "file.json");
const readJSON = fs.readFileSync(dataPath);

let datas = JSON.parse(readJSON);

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login.ejs", { title: "Login" });
});

app.post("/login", urlencodedParser, [
    check("email")
        .matches(/(^[a-zA-Z0-9_.]+[@]{1}[a-z0-9]+[\.][a-z]+$)/)
        .withMessage("Email salah, perhatikan format penulisan email yang benar."),
    check("password")
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{8,}$/)
        .withMessage("Password salah, perhatikan penggunaan huruf kapital."),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alert = errors.array();
        res.render("login", {
            alert, title: "Login",
        });
    } else {
        res.redirect("/dashboard");
    }
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard.ejs", {
        title: "Dashboard",
        datas,
        quicklink: "Dashboard",
        href: "/dashboard",
    });
});

app.get("/cars", (req, res) => {
    res.render("cars.ejs", {
        title: "List Car",
        datas,
        quicklink: "Cars",
        href: "/cars",
    });
});

app.get("/add", (req, res) => {
    res.render("add.ejs", {
        title: "Add Car",
        selectedData: "",
        titleContent: "List Car",
        action: "/add",
        quicklink: "Cars",
        href: "/cars",
    });
});

app.post("/add", urlencodedParser, (req, res) => {
    const {
        nama,
        harga,
        upload,
        start,
        finish,
        created,
        updated,
    } = req.body;

    const newData = {
        ID: datas.length + 1,
        car: nama,
        price: harga,
        uploadImg: upload,
        start: start,
        finish: finish,
        created: created,
        updated: updated,
    };
    datas.push(newData);

    fs.writeFileSync(dataPath, JSON.stringify(datas, null, 4));
    res.redirect("/cars");
});

app.get("/edit/:id", (req, res) => {
    const { id } = req.params;

    const selectedData = datas.filter((element) => element.ID === parseInt(id, 10));

    console.log(selectedData);
    res.render("add.ejs", {
        selectedData: selectedData[0],
        title: "Edit Data",
        titleContent: "Edit Car",
        action: `/edit/${id}`,
        quicklink: "Cars",
        href: "/cars",
    });
});

app.post("/edit/:id", urlencodedParser, (req, res) => {
    const { id } = req.params;
    const {
        nama,
        harga,
        upload,
        start,
        finish,
        created,
        updated,
    } = req.body;

    for (let i = 0; i < datas.length; i += 1) {
        if (datas[i].ID === parseInt(id, 10)) {
            datas[i].car = nama;
            datas[i].price = harga;
            datas[i].uploadImg = upload;
            datas[i].start = start;
            datas[i].finish = finish;
            datas[i].created = created;
            datas[i].updated = updated;
        }
    }

    fs.writeFileSync(dataPath, JSON.stringify(datas, null, 4));
    res.redirect("/cars");
});

app.get("/delete/:id", (req, res) => {
    const { id } = req.params;
    const newData = datas.filter((data) => data.ID !== parseInt(id, 10));
    datas = newData;
    console.log(datas);
    fs.writeFileSync(dataPath, JSON.stringify(datas, null, 4));
    console.log(datas);
    res.redirect("/cars");
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});
