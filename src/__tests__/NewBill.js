
import { screen, fireEvent} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js";
import firebase from "../__mocks__/firebase";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render NewBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })

    
describe("When I upload a file with the wrong format", () => {
  test("Then the bill shouldn't be created", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, "localStorage", {value: localStorageMock,})
        window.localStorage.setItem("user", JSON.stringify({type: "Employee",})
        )
        const firestore = null
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBill = new NewBill({document, onNavigate, firestore, localStorage: window.localStorage,})
        const handleSubmit = jest.fn(newBill.handleSubmit)
        newBill.fileName = "invalid"
        const submitBtn = screen.getByTestId("form-new-bill")
        submitBtn.addEventListener("submit", handleSubmit)
        fireEvent.submit(submitBtn)
        expect(handleSubmit).toHaveBeenCalled()
      })
    })

       

      test('Then the name of the file should be present in the input file', () => {
        document.body.innerHTML = NewBillUI()
        const inputFile = screen.getByTestId('file')
        const inputData = {
            file: new File(['test'], 'test.png', {type: 'image/png',}),
        }
        const newBill = new NewBill({document,})
        userEvent.upload(inputFile, inputData.file)
        expect(inputFile.files[0]).toStrictEqual(inputData.file)
      })
    })
  })



// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
	describe("When I create a new bill", () => {
	  test("add bill to mock API POST", async () => {
		const newBill = {
		  id: "654d6szd54d65f4d5f4df5d4f",
		  vat: "10",
		  fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
		  status: "pending",
		  type: "Hôtel",
		  commentary: "newbill POST",
		  name: "POST",
		  fileName: "preview-facture-free-201801-pdf-1.jpg",
		  date: "2021-07-21",
		  amount: 100,
		  commentAdmin: "ok",
		  email: "a@a",
		  pct: 20,
		}
		const postSpy = jest.spyOn(firebase, "post")
		const bills = await firebase.post(newBill)
		expect(postSpy).toHaveBeenCalledTimes(1)
		expect(bills.data.length).toBe(5)
	  });
	  test("add bill to API and fails with 404 message error", async () => {
		firebase.post.mockImplementationOnce(() => 
			Promise.reject(new Error("Erreur 404")))
		const html = BillsUI({ error: "Erreur 404" })
		document.body.innerHTML = html;
		const message = await screen.getByText(/Erreur 404/)
		expect(message).toBeTruthy();
	  })
	  test("add bill to API and fails with 500 message error", async () => {
		firebase.post.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")))
		const html = BillsUI({ error: "Erreur 500" })
		document.body.innerHTML = html
		const message = await screen.getByText(/Erreur 500/)
		expect(message).toBeTruthy()
	  });
	});
});