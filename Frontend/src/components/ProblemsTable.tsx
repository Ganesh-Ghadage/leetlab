import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, PencilIcon, TrashIcon, Loader } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";
import type { Problem } from "../types/Problem";
import { useProblemStore } from "../store/useProblemStore";
import AddToPlaylistModal from "./AddToPlaylist";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import CreatePlaylistBtn from "./CreatePlaylistBtn";

type props = {
	problems: Problem[];
};

const ProblemsTable = ({ problems }: props) => {
	const [search, setSearch] = useState<string>("");
	const [difficulty, setDifficulty] = useState<string>("ALL");
	const [selectedTag, setSelectedTag] = useState<string>("ALL");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
		useState<boolean>(false);
	const [isDeleteProblemModalOpen, setIsDeleteProblemModalOpen] =
		useState<boolean>(false);
	const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
		null
	);
	const [selectedDeleteProblemId, setSelectedDeleteProblemId] =
		useState<string>("");

	const { authUser } = useAuthStore();
	const { deleteProblem, isProblemDeleting } = useProblemStore();

	const navigate = useNavigate();

	const difficulties = ["EASY", "MEDIUM", "HARD"];

	const allTags: string[] = useMemo(() => {
		if (!Array.isArray(problems)) return [];

		const tagSet = new Set<string>();

		problems.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));

		return Array.from(tagSet);
	}, [problems]);

	const filteredProblems = useMemo(() => {
		setCurrentPage(1)
		return (problems || [])
			.filter((problem) =>
				problem.title.toLowerCase().includes(search.toLowerCase())
			)
			.filter((problem) =>
				difficulty === "ALL" ? true : problem.difficulty === difficulty
			)
			.filter((problem) =>
				selectedTag === "ALL" ? true : problem.tags?.includes(selectedTag)
			);
	}, [problems, search, difficulty, selectedTag]);

	const itemsPerPage = 10;
	const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
	const paginatedProblems = useMemo(() => {
		return filteredProblems.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);
	}, [filteredProblems, currentPage]);

	const handleProblemDelete = (id: string) => {
		setIsDeleteProblemModalOpen(true);
		setSelectedDeleteProblemId(id);
	};

	const handleAddToPlaylist = (problemId: string) => {
		setSelectedProblemId(problemId);
		setIsAddToPlaylistModalOpen(true);
	};

	const handleConfirmProblemDelete = async () => {
		await deleteProblem(selectedDeleteProblemId);
		navigate("/problem");
	};

	return (
		<div className="flex flex-col md:flex-row gap-8 mb-6">
			<div className="w-full max-w-6xl mx-auto">
				{/* Header with Create Playlist Button */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold">Problems</h2>
					<CreatePlaylistBtn />
				</div>

				{/* Filters */}
				<div className="flex flex-wrap justify-between items-center mb-6 gap-4">
					<input
						type="text"
						placeholder="Search by title"
						className="input input-bordered w-full md:w-1/3 bg-base-200"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<select
						className="select select-bordered bg-base-200"
						value={difficulty}
						onChange={(e) => setDifficulty(e.target.value)}
					>
						<option value="ALL">All Difficulties</option>
						{difficulties.map((diff) => (
							<option
								key={diff}
								value={diff}
							>
								{diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
							</option>
						))}
					</select>
					<select
						className="select select-bordered bg-base-200"
						value={selectedTag}
						onChange={(e) => setSelectedTag(e.target.value)}
					>
						<option value="ALL">All Tags</option>
						{allTags.map((tag) => (
							<option
								key={tag}
								value={tag}
							>
								{tag}
							</option>
						))}
					</select>
				</div>

				{/* Table */}
				<div className="overflow-x-auto rounded-xl shadow-md">
					<table className="table table-zebra table-lg bg-base-200 text-base-content">
						<thead className="bg-base-300">
							<tr>
								<th>Solved</th>
								<th>Title</th>
								<th>Tags</th>
								<th>Difficulty</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{paginatedProblems.length > 0 ? (
								paginatedProblems.map((problem) => {
									const isSolved = problem?.solvedBy.some(
										(user) => user?.userId === authUser?.id
									);
									const isDemo = problem.tags.some((tag) => tag === "Demo");
									return (
										<tr
											key={problem.id}
											className="relative"
										>
											<td>
												<input
													type="checkbox"
													checked={isSolved}
													readOnly
													className="checkbox checkbox-sm"
												/>
												{isDemo && (
													<span className="badge badge-info badge-sm absolute left-2 top-2">
														Demo
													</span>
												)}
											</td>
											<td>
												<Link
													to={`/problem/${problem.id}`}
													className="font-semibold hover:underline"
												>
													{problem.title}
												</Link>
											</td>
											<td>
												<div className="flex flex-wrap gap-1">
													{(problem.tags || []).map(
														(tag, idx) =>
															tag !== "Demo" && (
																<span
																	key={idx}
																	className="badge badge-outline badge-warning text-xs font-bold"
																>
																	{tag}
																</span>
															)
													)}
												</div>
											</td>
											<td>
												<span
													className={`badge font-semibold text-xs text-white ${
														problem.difficulty === "EASY"
															? "badge-success"
															: problem.difficulty === "MEDIUM"
															? "badge-warning"
															: "badge-error"
													}`}
												>
													{problem.difficulty}
												</span>
											</td>
											<td>
												<div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
													{authUser?.role === "ADMIN" && (
														<div className="flex gap-2">
															<button
																onClick={() => handleProblemDelete(problem.id)}
																className="btn btn-sm btn-error"
																disabled={isProblemDeleting}
															>
																{isProblemDeleting ? (
																	<Loader className="animate-spin" />
																) : (
																	<TrashIcon className="w-4 h-4 text-white" />
																)}
															</button>
															<Link to={`/problem/edit/${problem.id}`}>
																<button
																	disabled
																	className="btn btn-sm btn-warning"
																>
																	<PencilIcon className="w-4 h-4 text-white" />
																</button>
															</Link>
														</div>
													)}
													<button
														className="btn btn-sm btn-outline flex gap-2 items-center"
														onClick={() => handleAddToPlaylist(problem.id)}
													>
														<Bookmark className="w-4 h-4" />
														<span className="hidden sm:inline">
															Save to Playlist
														</span>
													</button>
												</div>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td
										colSpan={5}
										className="text-center py-6 text-gray-500"
									>
										No problems found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="flex justify-center mt-6 gap-2">
					<button
						className="btn btn-sm"
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((prev) => prev - 1)}
					>
						Prev
					</button>
					<span className="btn btn-ghost btn-sm">
						{currentPage} / {totalPages}
					</span>
					<button
						className="btn btn-sm"
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage((prev) => prev + 1)}
					>
						Next
					</button>
				</div>

				{/* Modals */}

				<AddToPlaylistModal
					isOpen={isAddToPlaylistModalOpen}
					onClose={() => setIsAddToPlaylistModalOpen(false)}
					problemId={selectedProblemId ?? ""}
				/>

				<ConfirmDeleteModal
					isOpen={isDeleteProblemModalOpen}
					isLoading={isProblemDeleting}
					onClose={() => setIsDeleteProblemModalOpen(false)}
					onConfirm={handleConfirmProblemDelete}
				/>
			</div>

			<div className="bg-base-300 rounded-xl h-[120dvh] w-full max-w-64 ">
				<h1 className="text-lg font-bold p-2 px-4">Learn By Topic</h1>

				<div className="bg-base-200 rounded-xl flex flex-wrap gap-2 p-4 w-full h-full overflow-y-auto">
					{allTags.map((tag, idx) => (
						<span
							key={idx}
							onClick={() => setSelectedTag(tag)}
							className="badge badge-outline badge-info text-md h-fit w-fit inline font-bold cursor-pointer"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProblemsTable;
