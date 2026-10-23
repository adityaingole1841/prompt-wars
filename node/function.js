// // FUNCTION DECLERATIION
// function greet(name) {
//     console.log("Hello, " + name );
// }
// greet("Aditya");
// // FUNCTION EXPRESSION/
// const a = function(name) {
//     console.log("Hello, " +name);
// }
// a("Aditya");


// let b = (name) => {
//     console.log("Hello, " + name);
// }
// b("Aditya");

// let arr =["mango","banana","apple","grapes","orange"];
// console.log(arr);

// console.log(arr[1]);
// console.log(arr[2]);
// arr[0] = "banana";

// console.log(arr);
// console.log(arr.length);
// console.log(arr.indexOf("apple"));
// console.log(arr.includes("Orange"));
// console.log(arr.push("kiwi"));
// console.log(arr.slice(0,2));

//  arr.push("kiwi");
// console.log(arr);

// arr.pop();
// console.log(arr);













// let student ={
//     name: "Aditya",
//     age: 20,
//     course: "B.Tech",
//     lastName: "Ingole",
//     "": "empty string",

//     greet: function() {
//         console.log("Hello, from object " + this.name);

//     }
// }
// console.log(student);
// console.log(student.name);
// console.log(student.age);
// console.log(student.lastName);
// student.address = "pune";
// console.log(student);
// student.age = 21;
// console.log(student);
// delete student.address;

// console.log(student);

// // console.log(student.name);

// console.log(student["name"]);
// console.log(student["lastName"]);
// console.log(student[""]);
// console.log(student["greet"]);

// console.log(Object.keys(student))
// console.log(Object.values(student))

// let arr =[
//     { name: "Aditya" },
//     { name: "shubham", age: 20 },

// ];

// console.log(arr[0].name);
// console.log(arr[1].age);

 function main(age) {
    if (age > 18) {
        console.log("You are an adult.");
    } else {
        console.log("You are a minor.");
    }
}