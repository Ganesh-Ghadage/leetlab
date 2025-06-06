import { db } from "../libs/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createSheet = asyncHandler(async (req, res) => {
	const { title, company, description } = req.body;

	try {
		const exisitingSheet = await db.Sheet.findUnique({
			where: {
				title_company: {
					title,
					company,
				},
			},
		});

		if (exisitingSheet) {
			throw new ApiError(406, `${title} sheet already exists for ${company}`);
		}

		const sheet = await db.Sheet.create({
			data: {
				title,
				company,
				description,
				userId: req.user.id,
			},
		});

		if (!sheet) {
			throw new ApiError(400, "Sheet creation failed");
		}

		return res
			.status(201)
			.json(new ApiResponce(201, sheet, "Sheet created successfully"));
	} catch (error) {
		console.error("Error While creating sheet", error);
		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error While creating sheet",
			error
		);
	}
});

export const getAllSheets = asyncHandler(async (req, res) => {
	try {
		const sheets = await db.Sheet.findMany({
			include: {
				orders: {
					where: {
						status: "paid"
					},
					include: {
						user: true,
					}
				},
			},
		});

		if (!sheets) {
			throw new ApiError(404, "No sheets found");
		}

		return res
			.status(200)
			.json(new ApiResponce(200, sheets, "Sheets fetched successfully"));
	} catch (error) {
		console.error("Error while fetching sheets", error);

		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error while fetching sheets",
			error
		);
	}
});

export const getSheetById = asyncHandler(async (req, res) => {
	const { sheetId } = req.params;

	try {
		// TODO: add payment integration

		const sheet = await db.Sheet.findUnique({
			where: {
				id: sheetId,
			},
			include: {
				problems: {
					include: {
						problem: true,
					},
				},
				orders: {
					where: {
						status: "paid"
					},
					include: {
						user: true,
					}
				},
			},
		});

		if (!sheet) {
			throw new ApiError(404, "Sheet not found");
		}

		return res
			.status(200)
			.json(new ApiResponce(200, sheet, "Sheet fetched successfully"));
	} catch (error) {
		console.error("Error while fetching sheet", error);

		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error while fetching sheet",
			error
		);
	}
});

export const updateSheet = asyncHandler(async (req, res) => {
	const { title, company, description } = req.body;
	const { sheetId } = req.params;

	try {
		const sheet = await db.Sheet.findUnique({
			where: {
				id: sheetId,
			},
		});

		if (!sheet) {
			throw new ApiError(404, "sheet not found");
		}

		const updatedSheet = await db.Sheet.update({
			where: {
				id: sheetId,
			},
			data: {
				title,
				company,
				description,
			},
		});

		return res
			.status(200)
			.json(new ApiResponce(200, updatedSheet, "Sheet updated successfully"));
	} catch (error) {
		console.error("Error while updating sheet", error);

		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error while updating sheet",
			error
		);
	}
});

export const addProblemInSheet = asyncHandler(async (req, res) => {
	const { sheetId } = req.params;
	const { problemIds } = req.body;

	try {
		const exisitingSheet = await db.Sheet.findUnique({
			where: {
				id: sheetId,
			},
		});

		if (!exisitingSheet) {
			throw new ApiError(404, "Sheet not found");
		}

		const sheetProblems = [];

		for (let i = 0; i < problemIds.length; i++) {
			const problemId = problemIds[i];

			const addedProblem = await db.ProblemInSheet.upsert({
				where: {
					sheetId_problemId: {
						problemId,
						sheetId,
					},
				},
				update: {},
				create: {
					sheetId,
					problemId,
				},
			});

			sheetProblems.push(addedProblem);
		}

		return res
			.status(201)
			.json(
				new ApiResponce(
					201,
					sheetProblems,
					"Problem added in sheet successfully"
				)
			);
	} catch (error) {
		console.error("Error While adding problems in sheet", error);
		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error While adding problems in sheet",
			error
		);
	}
});

export const removeProblemFromSheet = asyncHandler(async (req, res) => {
	const { sheetId } = req.params;
	const { problemIds } = req.body;

	try {
		const exisitingSheet = await db.Sheet.findUnique({
			where: {
				id: sheetId,
			},
		});

		if (!exisitingSheet) {
			throw new ApiError(404, "Playlist not found");
		}

		const deletedProblems = await db.ProblemInSheet.deleteMany({
			where: {
				sheetId,
				problemId: {
					in: problemIds,
				},
			},
		});

		return res
			.status(200)
			.json(
				new ApiResponce(
					200,
					deletedProblems,
					"Problem removed successfully from sheet"
				)
			);
	} catch (error) {
		console.error("Error While removing problem from sheet", error);
		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error While removing problem from sheet",
			error
		);
	}
});

export const deleteSheet = asyncHandler(async (req, res) => {
	const { sheetId } = req.params;

	try {
		const exisitingSheet = await db.Sheet.findUnique({
			where: {
				id: sheetId,
			},
		});

		if (!exisitingSheet) {
			throw new ApiError(404, "Sheet not found or already deleted");
		}

		//TODO: add check if we have any paid active user purchase for sheet

		const deletedSheet = await db.Sheet.delete({
			where: {
				id: sheetId,
			},
		});

		return res
			.status(200)
			.json(new ApiResponce(200, deletedSheet, "Sheet deleted successfully"));
	} catch (error) {
		console.error("Error While deleting sheet", error);
		throw new ApiError(
			error.statusCode || 500,
			error?.message || "Error While deleting sheet",
			error
		);
	}
});
