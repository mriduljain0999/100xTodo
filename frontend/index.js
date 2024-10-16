const todoArr = document.querySelector(".todos");

window.onload = function() {
    fetch();
};

function dashGreet(){
    const date = new Date();
    const greet = document.querySelector(".dash-greet")
    if(date.getHours() >= 3 && date.getHours() <= 11){
        greet.innerHTML = "Good morning, ";
    }
    else if(date.getHours() >= 12 && date.getHours() <= 17){
        greet.innerHTML = "Good afternoon, ";
    }
    else if(date.getHours() >= 18 && date.getHours() <= 23){
        greet.innerHTML = "Good evening, ";
    }
    else if(date.getHours() >= 0 && date.getHours() < 3){
        greet.innerHTML = "Good night, ";
    }
}
setInterval(dashGreet, 3500000);
dashGreet();

async function addTodo(){
    try{
        const todo = document.querySelector("input").value;
        const response = await axios.post("http://localhost:3000/add-todo",{
            desc:todo,
            status:false
        },{
            headers: {
                token:localStorage.getItem("token")
            }
        })
        fetch();
    }
    catch(e){
        alert("Unauthorized request!")
    }
}

async function fetch(){
    try{
        const todos = await axios.get("http://localhost:3000/get-todos",{
            headers: {
                token: localStorage.getItem('token')
            }
        });
        const username = await axios.get("http://localhost:3000/username",{
            headers: {
                token: localStorage.getItem('token')
            }
        })
        document.querySelector(".username").innerHTML = username.data;
        render(todos.data);
        attachCheckboxListeners();
        
    }catch(e){
        alert("Unauthorized request or server error!")
    }
}

function render(todos){
    todoArr.innerHTML = "";
    for(let i=0;i<todos.length;i++){
        let todoDiv = component(todos[i]);
        todoArr.appendChild(todoDiv);
    }
}
function component(todo){
    let div = document.createElement("div");
    let choDiv = document.createElement("div")
    let checkbox = document.createElement("input");
    let description = document.createElement("p")
    let deleteButton = document.createElement("button")

    description.innerHTML = todo.desc;
    checkbox.setAttribute("type","checkbox");
    checkbox.classList.add("check");
    if(todo.status){
        checkbox.checked = true;
    }
    deleteButton.innerHTML = `<i class="fa fa-trash"></i>`;
    deleteButton.classList.add("delete")
    deleteButton.addEventListener("click", (e) => deleteTodo(e));

    div.classList.add("todoDiv");
    choDiv.classList.add("choDiv");
    choDiv.appendChild(checkbox)
    choDiv.appendChild(description)
    div.appendChild(choDiv)
    div.appendChild(deleteButton);
    return div;
}

function logout(){
    localStorage.removeItem('token');
    window.location.href = "signup.html";
}  

async function deleteTodo(e,todo){
    try{
        const todo = e.target.parentNode.parentNode.children[0].children[1].textContent;
        // console.log(e.target.parentNode.parentNode.children[0].children[1].textContent);
        const response = await axios.delete('http://localhost:3000/delete', {
            headers: {
                token: localStorage.getItem('token')
            },
            data: {
                todo
            }
        });
        fetch();
    }catch(e){
        console.log(e);
    }
}


function attachCheckboxListeners(){
    document.querySelectorAll(".check").forEach((checkbox) => {
        checkbox.addEventListener("input",async function(){
            const todo = checkbox.parentElement.children[1].innerHTML
            try {
                await axios.put('http://localhost:3000/update-status', {
                    desc: todo,
                    status: checkbox.checked
                }, {
                    headers: {
                        token: localStorage.getItem('token'),
                    },
                });
            } catch (error) {
                alert("Error updating status:", error);
            }
        })
    })
}