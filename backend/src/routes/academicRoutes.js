const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { auth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const { gradeValidation, attendanceValidation, dateRangeValidation, idValidation } = require('../middlewares/validation');

router.use(auth);

router.get(
  '/grades',
  authorize(ROLES.STUDENT, ROLES.PARENT),
  dateRangeValidation,
  academicController.getGrades
);

router.get(
  '/grades/:childStudentId',
  authorize(ROLES.PARENT),
  idValidation,
  academicController.getGrades
);

router.get(
  '/attendance',
  authorize(ROLES.STUDENT, ROLES.PARENT),
  dateRangeValidation,
  academicController.getAttendance
);

router.get(
  '/attendance/:childStudentId',
  authorize(ROLES.PARENT),
  idValidation,
  academicController.getAttendance
);

router.get(
  '/timetable',
  authorize(ROLES.STUDENT, ROLES.PARENT),
  academicController.getTimetable
);

router.get(
  '/timetable/:childStudentId',
  authorize(ROLES.PARENT),
  idValidation,
  academicController.getTimetable
);

router.post(
  '/grades',
  authorize(ROLES.TEACHER),
  gradeValidation,
  academicController.addGrade
);

router.post(
  '/attendance',
  authorize(ROLES.TEACHER),
  attendanceValidation,
  academicController.recordAttendance
);

module.exports = router;
