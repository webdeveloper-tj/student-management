const tbody = document.querySelector("#students-table tbody");
const cancelButton = document.querySelector(".btn-cancel-farmon");
const saveButton = document.querySelector(".btn-save-farmon");
const closeButton = document.querySelector(".close-farmon");
let studentId;
const fn = async () => {
  const response = await fetch("http://localhost:3000/api/students");

  if (!response.ok) return;
  const students = await response.json();
  setTimeout(() => {
    const rows = document.querySelectorAll("#students-table tbody tr");
    const orders = document.querySelector("#orders");
    students.forEach((student) => {
      rows.forEach((row) => {
        row.addEventListener("dblclick", async () => {
          const response_farmon = await fetch(
            `http://localhost:3000/api/categorias/farmon/${row.getAttribute(
              "id"
            )}`
          );
          const create_farmon = document.createElement("button");
          create_farmon.type = "button";
          create_farmon.textContent = "Create new order";
          create_farmon.className = "create_farmon";
          if (!response_farmon.ok) {
            create_farmon.onclick = () => {
              studentId = student.id;
              const fullName = `${student.first_name} ${student.last_name} ${student.middle_name} `;
              const course = student.course || "N/A";
              const group = getNameById(student.group_id, "groups");

              const student_detals = document.querySelector(
                "#student_detals_create"
              );
              student_detals.setAttribute("data-id", student.id);
              student_detals.innerHTML = ` <td>${fullName} ${
                student.last_name
              } <td>${course}</td>  <td>${getNameById(group, "groups")}</td>`;
              document.getElementById("documentModal").style.display = "block";
            };
            orders.innerHTML = "";
            orders.appendChild(create_farmon);
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          const farmons = await response_farmon.json();

          if (orders.hasChildNodes()) {
            orders.innerHTML = "";
          }
          orders.append(create_farmon);
          create_farmon.addEventListener("click", () => {
            const fullName = `${student.first_name} ${student.last_name} ${student.middle_name} `;
            const course = student.course || "N/A";
            const group = getNameById(student.group_id, "groups");

            const student_detals = document.querySelector(
              "#student_detals_create"
            );
            student_detals.setAttribute("data-id", student.id);

            student_detals.innerHTML = ` <td>${fullName} ${
              student.last_name
            } <td>${course}</td>  <td>${getNameById(group, "groups")}</td>`;
            document.getElementById("documentModal").style.display = "block";
          });
          farmons.map((farmon) => {
            const order = document.createElement("div");
            order.className = "farmon-document";
            order.innerHTML = `
        <div class="" style="border:1px solid black; padding:40px; margin:0px auto; width:1240px;" >
            <img src="./image.png" width="120px" height="112px"
                style="margin: 0px auto; display: block; border-radius: 50%;" alt="logo">
                <h1 style="text-align: center;">
                    ВАЗОРАТИ МАОРИФ ВА ИЛМИ ҶУМҲУРИИ ТОҶИКИСТОН<br>
                    Донишгоҳи техникии Тоҷикистон ба номи академик М. С. Осими
                </h1>
                <h3 style="text-align: center;">ФАРМОИШ</h3>
                <div style="display: flex; row-gap: 2px; justify-content: center;">
                    Аз "${farmon.day}"-"${farmon.month}"соли 2025
                    №-${farmon.number}
                    ш. Душанбе
                </div>

                <h1 style="text-align: center;">${farmon.type_farmon}</h1>
                <p>${farmon.modda}</p>
                <h1 style="text-align: center;">ФАРМОИШ МЕДИХАМ:</h1>
                <p>${farmon.order}</p>
                <table id="full_name_student">
                    <thead>
                        <tr>
                            <td>Ному насаби домишчу</td>
                            <td>Kypc</td>
                            <td>Ихтисос</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr id="student_detals">
                           <td>${student.first_name} ${student.last_name} ${
              student.middle_name || ""
            }  <td>${student.course || ""}</td>  <td>${getNameById(
              student.group_id,
              "groups"
            )}
                        </td>
                        </tr>
                    </tbody>
                </table>
                <p class="indent-first">
                    Асос: гузориши декани факултет ва пешниҳоди муовини аввали ректор оид ба таълим.
                </p>
                <p>
                    &Tab; 2. Назорати имроиши фармоноль мазкур ба зимман муовини аввал, муовини
                    ректор онд ба тавлим Мачидзода Т.С. вогузор карда шавал.
                </p>
                <p style="display: flex; justify-content: space-between; width: 500px; margin: 0px auto;">
                    <span>Ректор</span>
                    <span>
                        Давлатзода К.К.
                    </span>
                </p>
                </br>
                </br></br>
                </br></br>
                </br>
                <p>Нусха дуруст аст</p>
                <p style="display: flex; justify-content: space-between; width: 500px; margin: 0px auto;">
                    <span>Cардори РК ва KM ___________</span>
                    <span>
                        Кодирзода Н.Ҳ
                    </span>
                </p>
               <div style="display:flex; justify-content:end; column-gap:5px;">
                 <button class="print-farmon no-export">Print</button>
                 <button class="export-pdf no-export">Export to pdf</button>
               </div>
        </div>

        `;
            orders.appendChild(order);
            const printBtn = order.querySelector(".print-farmon");
            const exportBtn = order.querySelector(".export-pdf");
            printBtn.addEventListener("click", () => {
              printFarmon(order);
            });
            exportBtn.addEventListener("click", () => {
              exportToPdf(order);
            });
          });
        });
      });
    });
  }, 2000);
};
cancelButton.addEventListener("click", () => {
  document.getElementById("documentModal").style.display = "none";
});
closeButton.addEventListener("click", () => {
  document.getElementById("documentModal").style.display = "none";
});
fn();

saveButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const day = document.querySelector("#day");
  const month = document.querySelector("#month");
  const number = document.querySelector("#number");
  const modda_type = document.querySelector("#modda_type");
  const order_type = document.querySelector("#order_type");
  const type_farmon_element = document.querySelector("#type_farmon");
  const student_detals = document.querySelector("#student_detals_create");
  const data = {
    id: student_detals.getAttribute("data-id"),
    day: day.value.trim(),
    month: month.value.trim(),
    number: number.value.trim(),
    type_farmon: type_farmon_element.value.trim(),
    modda: modda_type.value.trim(),
    order: order_type.value.trim(),
  };
  try {
    const response = await fetch(
      "http://localhost:3000/api/categorias/farmon",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    alert("Order created successfully!");
  } catch (error) {
    console.error("Error creating student:", error);
    alert("Failed to create student. Check console for details.");
  }
});

function printFarmon(element) {
  const originalContents = document.body.innerHTML;
  const printContents = element.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;

  // Re-attach event listeners after restoring the content
  window.location.reload();
}

async function exportToPdf(element) {
  const { jsPDF } = window.jspdf;

  try {
    // Hide elements that shouldn't be exported
    const noExportElements = element.querySelectorAll(".no-export");
    noExportElements.forEach((el) => {
      el.style.visibility = "hidden";
      el.style.position = "absolute";
    });

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Restore the hidden elements
    noExportElements.forEach((el) => {
      el.style.visibility = "";
      el.style.position = "";
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`farmon_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}
