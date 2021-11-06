import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from '../views/BillsUI'
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import firebase from "../__mocks__/firebase"
import firestore from "../app/Firestore.js"

describe("Given I am connected as an employee an I am on a NewBill page", () => {
  describe("When I upload a proof file", () => {
    test("Then it should have been changed in the input", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["myProof.png"], "myProof.png", { type: "image/png" })]
        }
      })
      
      expect(handleChangeFile).toHaveBeenCalled();      
      expect(inputFile.files[0].name).toBe("myProof.png");
    })    
  })

  describe("When I submit the form with a not valid proof file", () => {
    test("It should not submit the form and stay on NewBill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      newBill.fileName = 'invalid'
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy() 
    })
  })

  describe("When I submit the form with a proof file", () => {
    test("It should create a new bill with a proof file", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as an Employee", () => {
  describe("When I create a new bill", () => {
    test("it should add bill to mock API POST", async () => {
       const postSpy = jest.spyOn(firebase, "post")
       const newBill = {
        "id": "cqDH5SzMAecZAGRrHjaC",
        "vat": "80",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "Déplacement Florence",
        "name": "Reportage photo",
        "fileName": "preview-facture-free-202105-pdf-1.jpg",
        "date": "2021-05-20",
        "amount": 345,
        "commentAdmin": "ok",
        "email": "jane.doe@mail.com",
        "pct": 20
       }
       const bills = await firebase.post(newBill)
       expect(postSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(5)
    })
    test("it should add bill from an API but fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("It should add bill from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})