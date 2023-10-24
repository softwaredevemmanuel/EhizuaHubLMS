import {Routes,Route} from 'react-router-dom'
import TutorLogin from './pages/Tutor/TutorLogin'
import PupilsDashboard from './pages/PartnerSchoolStudents/PupilsDashboard'
import HomePage from './pages/PartnerSchoolStudents/SchoolsHomePage'
import StudentDashboard from './pages/Student/StudentDashboard'
import StaffDashboard from './pages/Staff/StaffDashboard'
import SchoolsHomePage from './pages/PartnerSchoolStudents/SchoolsHomePage'
import AdminDashboard from './pages/Admin/AdminDashboard'


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/admin_dashboard' element={<AdminDashboard/>}/>
        <Route path='/staff_dashboard' element={<StaffDashboard/>}/>
        <Route path='/tutor_dashboard' element={<TutorLogin/>}/>
        <Route path='/student_dashboard' element={<StudentDashboard/>}/>
        <Route path='/schools_homepage' element={<SchoolsHomePage/>}/>
        <Route path='/school_student_dashboard' element={<PupilsDashboard/>}/>
      </Routes>
    </div>
  )
}

export default App
